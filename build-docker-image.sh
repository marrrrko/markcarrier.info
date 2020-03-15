#!/bin/bash

IMAGE_NAME="markcarrier.info"
docker build -t $IMAGE_NAME .
ID=$(docker image ls -q|head -1)

# Github
GITHUB_OWNER="markcarrier"
GITHUB_REPO="markcarrier.info"
GITHUB_TAG="docker.pkg.github.com/$GITHUB_OWNER/$GITHUB_REPO/$IMAGE_NAME"
docker tag $ID $GITHUB_TAG
#docker login -u $OWNER -p $TOKEN docker.pkg.github.com
#docker push docker.pkg.github.com/$OWNER/$REPOSITORY/$IMAGE_NAME

# AWS ECR
AWS_ECR_REGISTRY="879679279257.dkr.ecr.ca-central-1.amazonaws.com"
AWS_ECR_REPO="markcarrier-resume"
AWS_TAG="$AWS_ECR_REGISTRY/$AWS_ECR_REPO:latest"
docker tag $ID $AWS_TAG
#docker push $AWS_ECR_REGISTRY/$AWS_ECR_REPO:latest



