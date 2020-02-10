const awsutil = require('./aws-util')
const { exec } = require("child_process");
const config = require('config')
const fs = require('fs')

async function registerTaskDefinition(awsConfig) {

    const callECS = awsutil.createAWSAPICaller("ECS", { apiVersion: "2014-11-13", region: awsConfig.region })

    console.log("Registering updated task definition.")
    const taskDef = {
        family: `${awsConfig.appName}-taskdef`,
        networkMode: "awsvpc",
        executionRoleArn: "arn:aws:iam::879679279257:role/ecsTaskExecutionRole",
        containerDefinitions: [
            {
                logConfiguration: {
                    logDriver: "awslogs",
                    options: {
                        "awslogs-group": "/ecs/" + awsConfig.appName,
                        "awslogs-region": awsConfig.region,
                        "awslogs-stream-prefix": "ecs"
                    }
                },
                portMappings: [
                    {
                        hostPort: awsConfig.appInternalPort,
                        protocol: "tcp",
                        containerPort: awsConfig.appInternalPort
                    }
                ],
                cpu: 0,
                memory: 300,
                memoryReservation: 128,
                image: `${awsConfig.ecrRepository}:latest`,
                essential: true,
                name: `${awsConfig.appName}-container`,
            }
        ],
        requiresCompatibilities: [
            "FARGATE"
        ],
        cpu: awsConfig.cpu,
        memory: awsConfig.memory
    }
    await callECS("registerTaskDefinition", taskDef)
    await saveTaskDefToFile(taskDef)

    return awsConfig
}

async function saveTaskDefToFile(taskDef) {
    return new Promise(function(resolve, reject) {
        const data = JSON.stringify(taskDef, null,  "  ")
        fs.writeFile("aws/ecs-taskdef.json", data, (err) => {
            if(err)
                reject(err)
            else
                resolve()
        })
    })
}

async function deployToCluster(awsConfig) {
    console.log("Deploying service")
    const callECS = awsutil.createAWSAPICaller("ECS", { apiVersion: "2014-11-13", region: awsConfig.region })
    const callLogs = awsutil.createAWSAPICaller("CloudWatchLogs", { apiVersion: "2014-03-28", region: awsConfig.region })

    const existingLogs = await callLogs("describeLogGroups", {
        logGroupNamePrefix: "/ecs/" + awsConfig.appName
    })
    if(!existingLogs.logGroups.length) {
        console.log("Creating log group")
        await callLogs("createLogGroup", {
            logGroupName: "/ecs/" + awsConfig.appName
        })
    }

    const existingServices = await callECS("describeServices", {
        cluster: awsConfig.clusterArn,
        services: [ `${awsConfig.appName}-serv` ]      
    })

    if(existingServices.services.length) {
        return await updateService(arguments[0])
    } else {
        return await createService(arguments[0])
    }
}

async function createService(awsConfig) {

    console.log("Creating service")
    const callECS = awsutil.createAWSAPICaller("ECS", { apiVersion: "2014-11-13", region: awsConfig.region })
    
    const service = await callECS("createService", {
        launchType: "FARGATE",
        taskDefinition: `${awsConfig.appName}-taskdef`,
        serviceName: `${awsConfig.appName}-serv`,
        cluster: awsConfig.clusterArn,
        desiredCount: awsConfig.desiredCount,
        loadBalancers: [
            {
                containerName: `${awsConfig.appName}-container`,
                containerPort: awsConfig.appInternalPort.toString(),
                targetGroupArn: awsConfig.loadBalancerTargetGroupArn
            },
        ],
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: awsConfig.subnetIds,
                assignPublicIp: "ENABLED",
                securityGroups: [awsConfig.clusterSecurityGroupId]
            }
        }
    })

    console.log("Done!")

    return awsConfig
}

async function updateService(awsConfig) {

    console.log("Updating service")
    const callECS = awsutil.createAWSAPICaller("ECS", { apiVersion: "2014-11-13", region: awsConfig.region })
    
    const service = await callECS("updateService", {        
        cluster: awsConfig.clusterArn,
        service: `${awsConfig.appName}-serv`,
        taskDefinition: `${awsConfig.appName}-taskdef`,        
        desiredCount: awsConfig.desiredCount
    })

    console.log("Done!")
    
    return awsConfig
}

async function buildDockerImageAndPushToRepo(awsConfig) {
    //Should create repo if missing
    //aws ecr create-repository --repository-name $CONTAINER_REPO_NAME --region $REGION
    await runCommand(`$(aws ecr get-login --no-include-email --region ${awsConfig.region})`)
    await runCommand(`docker build -t ${awsConfig.appName} .`)
    await runCommand(`docker tag ${awsConfig.appName}:latest ${awsConfig.ecrRepository}:latest`)
    await runCommand(`docker push ${awsConfig.ecrRepository}:latest`)
}

async function runCommand(command) {
    return new Promise(function(resolve, reject) {
        const process = exec(command)

        process.stdout.on('data', (data) => {
            console.log(data.toString())
        })

        process.stderr.on('data', (data) => {
            console.log('stderr: ' + data.toString())
        })

        process.on('exit', (code) => {
            if(code.toString().trim() === "0")
                resolve()
            else 
                reject(new Error("Command failed"))
        })
    })
}

function getAWSConfig() {
    return config.get("aws")    
}


function run() {
    Promise.resolve()
    .then(getAWSConfig)
    .then(buildDockerImageAndPushToRepo)
    .then(registerTaskDefinition)
    .then(deployToCluster)
    .then(function (awsConfig) {
        console.log("Service deployed to cluster.")
    })
    .catch((err) => {
        console.error(`Failed to deploy service`, err)
    })
}

run()