#!/bin/bash

# Create an ECR repository
aws ecr create-repository --repository-name markcarrier-resume--region ca-central-1

# Register the task definition
aws ecs register-task-definition --region ca-central-1 --cli-input-json file://./resume-aws-fargate-task-definition.json

# Create an ECS Fargate Cluster
aws ecs create-cluster --region ca-central-1 --cluster-name markcarrier-resume

# Create the ECS Service
aws ecs create-service --region ca-central-1 --cluster markcarrier-resume --service-name resume-service --task-definition markcarrier-resume:1 --desired-count 1 --launch-type "FARGATE" --network-configuration "awsvpcConfiguration={subnets=[subnet-0cccd80fd47d1d310,subnet-07acff8b9d97d4687],securityGroups=[sg-027d5ab304d610169]}"