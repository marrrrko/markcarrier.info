#!/bin/bash

source ./set_aws_config.sh

if [ "$1" == "create-repo" ]
then
    # Create an ECR repository
    aws ecr create-repository --repository-name $CONTAINER_REPO_NAME --region $REGION
elif [ "$1" == "register-task" ]
then
    # Register the task definition
    aws ecs register-task-definition --region $REGION --cli-input-json $TASK_DEF_FILE
elif [ "$1" == "create-service" ]
then
    # Create the ECS Service
    aws ecs create-service \
     --region $REGION \
     --cluster $CLUSTER_NAME \
     --service-name $SERVICE_NAME \
     --task-definition $TASK_DEF_NAME \
     --desired-count 1 \
     --launch-type "FARGATE" \
     --load-balancers $LOAD_BALANCER_CONFIG \
     --network-configuration $NETWORK_CONFIG
elif [ "$1" == "force-redeploy" ]
then
    # Force service deploy
    aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment
else
    echo "You must call this script with one of the following commands:"
    echo "  create-repo"
    echo "  register-task"
    echo "  create-service"
    echo "  force-redeploy"
    echo ""
    echo "You must also set the following environment variables in a script called set_aws_config.sh:"    
    echo '  CONTAINER_REPO_NAME="XYZ"'
    echo '  REGION="XYZ"'
    echo '  TASK_DEF_FILE="file://./resume-aws-fargate-task-definition.json"'
    echo '  TASK_DEF_NAME="XYZ:1"'
    echo '  CLUSTER_NAME="XYZ"'
    echo '  SERVICE_NAME="XYZ"'
    echo '  LOAD_BALANCER_CONFIG="targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=XYZ,containerPort=1234" \'
    echo '  NETWORK_CONFIG="awsvpcConfiguration={subnets=[subnet-abc123,subnet-abc456],securityGroups=[sg-abc123],assignPublicIp=ENABLED}"'
fi
