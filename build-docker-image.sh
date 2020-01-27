#!/bin/bash

OWNER="markcarrier"
REPOSITORY="markcarrier.info"
IMAGE_NAME="markcarrier.info"
docker build -t docker.pkg.github.com/$OWNER/$REPOSITORY/$IMAGE_NAME .

#docker login -u $OWNER -p $TOKEN docker.pkg.github.com
#docker push docker.pkg.github.com/$OWNER/$REPOSITORY/$IMAGE_NAME

