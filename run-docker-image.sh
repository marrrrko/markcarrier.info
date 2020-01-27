#!/bin/bash

OWNER="markcarrier"
REPOSITORY="markcarrier.info"
IMAGE_NAME="markcarrier.info"
docker run -d -p 9999:8888 docker.pkg.github.com/$OWNER/$REPOSITORY/$IMAGE_NAME
