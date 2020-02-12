const awsutil = require('./aws-util')
const { exec } = require("child_process");
const config = require('config')
const fs = require('fs')

const ecsTaskDefinitionFilename = "aws/ecs-taskdef.json"
const githubWorkflowFileName = ".github/workflows/ecs-deploy.yml"

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
                image: `${awsConfig.ecrRegistry}/${awsConfig.ecrRepository}:latest`,
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
    await saveFile(
        ecsTaskDefinitionFilename,
        JSON.stringify(taskDef, null,  "  "))
    
    const githubWorflow = createGithubWorkflow(awsConfig)
    await saveFile(githubWorkflowFileName, githubWorflow)


    return awsConfig
}

async function saveFile(filename, data) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(filename, data, (err) => {
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
    await runCommand(`docker tag ${awsConfig.appName}:latest ${awsConfig.ecrRegistry}/${awsConfig.ecrRepository}:latest`)
    await runCommand(`docker push ${awsConfig.ecrRegistry}/${awsConfig.ecrRepository}:latest`)

    return awsConfig
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



function createGithubWorkflow(awsConfig) {
    return `
on:
  push:
    branches:
      - master

name: Deploy to Amazon ECS

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v1

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${awsConfig.region}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push image to Amazon ECR
      id: build-image
      env:
        ECR_REGISTRY: \${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: ${awsConfig.ecrRepository}
        IMAGE_TAG: \${{ github.sha }}
      run: |
        # Build a docker container and
        # push it to ECR so that it can
        # be deployed to ECS.
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        echo "::set-output name=image::$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"

    - name: Fill in the new image ID in the Amazon ECS task definition
      id: task-def
      uses: aws-actions/amazon-ecs-render-task-definition@v1
      with:
        task-definition: ${ecsTaskDefinitionFilename}
        container-name: ${awsConfig.appName}-container
        image: \${{ steps.build-image.outputs.image }}

    - name: Deploy Amazon ECS task definition
      uses: aws-actions/amazon-ecs-deploy-task-definition@v1
      with:
        task-definition: \${{ steps.task-def.outputs.task-definition }}
        service: ${awsConfig.appName}-serv
        cluster: ${awsConfig.clusterName}
        wait-for-service-stability: true

`
}