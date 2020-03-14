const awsutil = require('./aws-util')
const config = require('config')

async function createVpc(awsConfig) {
    try {
        const callEC2 = awsutil.createAWSAPICaller("EC2", { apiVersion: "2016-11-15", region: awsConfig.region })                        
        const vpc = await callEC2("createVpc", {
            CidrBlock: "10.0.0.0/16"
        })
        console.log(`Configuring new VPC ${vpc.Vpc.VpcId}`)
        const availabilityZones = await callEC2("describeAvailabilityZones")
        console.log("\t  - Creating first subnet")
        const firstSubnet = await callEC2("createSubnet", {
            CidrBlock: "10.0.0.0/24",
            VpcId: vpc.Vpc.VpcId,
            AvailabilityZoneId: availabilityZones.AvailabilityZones[0].ZoneId
        })
        console.log("\t  - Creating second subnet")
        const secondSubnet = await callEC2("createSubnet", {
            CidrBlock: "10.0.1.0/24",
            VpcId: vpc.Vpc.VpcId,
            AvailabilityZoneId: availabilityZones.AvailabilityZones[1].ZoneId
        })
        console.log("\t  - Creating internet gateway")
        const internetGateway = await callEC2("createInternetGateway")
        console.log("\t  - Attaching internet gateway to VPC")
        await callEC2("attachInternetGateway", {
            InternetGatewayId: internetGateway.InternetGateway.InternetGatewayId,
            VpcId: vpc.Vpc.VpcId
        })
        console.log("\t  - Creating route table")
        const routeTable = await callEC2("createRouteTable", {
            VpcId: vpc.Vpc.VpcId
        })
        console.log("\t  - Creating route")
        await callEC2("createRoute", {
            RouteTableId: routeTable.RouteTable.RouteTableId,
            GatewayId: internetGateway.InternetGateway.InternetGatewayId,
            DestinationCidrBlock: "0.0.0.0/0"
        })
        console.log("\t  - Associating route table to first subnet")
        await callEC2("associateRouteTable", {
            RouteTableId: routeTable.RouteTable.RouteTableId,
            SubnetId: firstSubnet.Subnet.SubnetId
        })
        console.log("\t  - Associating route table to second subnet")
        await callEC2("associateRouteTable", {
            RouteTableId: routeTable.RouteTable.RouteTableId,
            SubnetId: secondSubnet.Subnet.SubnetId
        })
        console.log(`VPC ready.\n`)

        return {
            ...awsConfig,
            VpcId: vpc.Vpc.VpcId,
            SubnetIds: [firstSubnet.Subnet.SubnetId, secondSubnet.Subnet.SubnetId],        
        }
    } catch (err) {
        console.log("Failed to setup network: " + err.toString())
        throw err
    }
}

async function createLoadBalancer(awsConfig) {

    const callEC2 = awsutil.createAWSAPICaller("EC2", { apiVersion: "2016-11-15", region: awsConfig.region })
    const callELBv2 = awsutil.createAWSAPICaller("ELBv2", { apiVersion: "2015-12-01", region: awsConfig.region })
    const callSTS = awsutil.createAWSAPICaller("STS", { apiVersion: "2011-06-15" })
    
    const loadBalancer = await callELBv2("createLoadBalancer", {
        Name: `${awsConfig.clusterName}-ecs-cluster-lb`,
        Subnets: [
            awsConfig.SubnetIds[0],
            awsConfig.SubnetIds[1]
        ]
    })
    console.log(`Configuring new load balancer ${loadBalancer.LoadBalancers[0].Name}`)
    console.log("\t  - Creating security group for load balancer")
    const lbSecurityGroup = await callEC2("createSecurityGroup", {
        Description: `${awsConfig.clusterName}-ecs-cluster-load-balancer-security-group`,
        GroupName: `${awsConfig.clusterName}-ecs-cluster-lb-sg`,
        VpcId: awsConfig.VpcId
    })

    console.log("\t  - Authorizing port 80 for load balancer")
    const lbSecurityRule = await callEC2("authorizeSecurityGroupIngress", {
        GroupId: lbSecurityGroup.GroupId,
        IpPermissions: [
            {
                FromPort: 80,
                IpProtocol: "tcp",
                IpRanges: [
                    {
                        CidrIp: "0.0.0.0/0",
                        Description: "HTTP for the world"
                    }
                ],
                ToPort: 80
            }
        ]
    })
    await callELBv2("setSecurityGroups", {
        LoadBalancerArn: loadBalancer.LoadBalancers[0].LoadBalancerArn,
        SecurityGroups: [lbSecurityGroup.GroupId]
    })

    console.log("\t  - Creating target group(s)")
    targetGroupConfigs = await createTargetGroups(callELBv2, awsConfig)

    console.log("\t  - Creating listener")
    const lbListener = await callELBv2("createListener", {
        DefaultActions: [
            {
                "Type": "forward",
                "Order": 1,
                "ForwardConfig": {
                    "TargetGroups": targetGroupConfigs.map(
                        appPort => ({
                            TargetGroupArn: appPort.targetGroupArn,
                            Weight: 1
                        })
                    )
                }
            }
        ],
        LoadBalancerArn: loadBalancer.LoadBalancers[0].LoadBalancerArn,
        Port: 80,
        Protocol: "HTTP"
    })

    console.log("\t  - Creating security group for cluster")
    const clusterSecurityGroup = await callEC2("createSecurityGroup", {
        Description: `${awsConfig.clusterName}-ecs-cluster-security-group`,
        GroupName: `${awsConfig.clusterName}-ecs-cluster-sg`,
        VpcId: awsConfig.VpcId
    })

    const userInfo = await callSTS("getCallerIdentity")
    console.log("\t  - Authorizing traffic from load balancer to cluster security group")
    const clusterIngressSecurityRule = await callEC2("authorizeSecurityGroupIngress", {
        GroupId: clusterSecurityGroup.GroupId,
        IpPermissions: awsConfig.appPorts.map(appPort => 
            ({
                FromPort: appPort.port,
                IpProtocol: "tcp",
                ToPort: appPort.port,
                UserIdGroupPairs: [
                    {
                        Description: appPort.name,
                        GroupId: lbSecurityGroup.GroupId,
                        UserId: userInfo.UserId
                    }
                ]
            })
        )
    })

    console.log("Load balancer and target group(s) ready.\n")

    return {
        ...awsConfig,
        LoaderBalancerArn: loadBalancer.LoadBalancers[0].LoadBalancerArn,
        appPorts: targetGroupConfigs,
        ClusterSecurityGroupId: clusterSecurityGroup.GroupId
    }
}

async function createTargetGroups(callELBv2, awsConfig) {
    const createAllTargetGroups = awsConfig.appPorts.map( async appPort => {
        const targetGroup = await callELBv2("createTargetGroup", {
            Name: `${awsConfig.clusterName}-${appPort.name}`,
            TargetType: "ip",
            Port: 80,
            Protocol: "HTTP",
            VpcId: awsConfig.VpcId,
            HealthCheckPath: "/api/health"
        })

        return {
            ...appPort,
            targetGroupArn: targetGroup.TargetGroups[0].TargetGroupArn
        }
    })

    return Promise.all(createAllTargetGroups)
}

async function createCluster(awsConfig) {

    const callECS = awsutil.createAWSAPICaller("ECS", { apiVersion: "2014-11-13", region: awsConfig.region })

    console.log("Creating ECS Fargate cluster")
    const cluster = await callECS("createCluster", {
        clusterName: awsConfig.clusterName
    })
    console.log(`${awsConfig.clusterName} cluster ready.\n`)

    return {
        ...awsConfig,
        ClusterArn: cluster.cluster.clusterArn
    }
}

function getAWSConfig() {
    return config.get("aws")
}

function run() {
    Promise.resolve()
    .then(getAWSConfig)
    .then(createVpc)
    .then(createLoadBalancer)
    .then(createCluster)
    .then(function(awsConfig) {
        console.log("Done.  You can now start deploying services using deploy-ecs-service.js.")
        console.log("You'll need to deal with DNS and load balancer listeners manually.")
        console.log("Don't forget to update your config file with the following values:")        
        console.log(JSON.stringify({
            "aws": {
                "clusterName": awsConfig.clusterName,
                "appName": awsConfig.appName,                
                "appPorts": awsConfig.appPorts,
                "region": awsConfig.region,
                "clusterArn": awsConfig.ClusterArn,
                "subnetIds": awsConfig.SubnetIds,        
                "loadBalancerTargetGroupArn": awsConfig.TargetGroupArn,            
                "clusterSecurityGroupId": awsConfig.ClusterSecurityGroupId,
                "cpu": awsConfig.cpu,
                "memory": awsConfig.memory,
                "desiredCount": awsConfig.desiredCount,
                "ecrRegistry": awsConfig.ecrRegistry,
                "ecrRepository": awsConfig.ecrRepository
            }
        }, null, "    "))
    })
    .catch((err) => {
        console.error(`Failed to setup cluster: ${err}`)
    })
}

run()