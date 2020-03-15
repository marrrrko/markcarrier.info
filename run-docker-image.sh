#!/bin/bash

IMAGE_NAME="markcarrier.info"
docker run -d -p 8888:8888 -p 8889:8889 -p 8890:8890 $IMAGE_NAME
