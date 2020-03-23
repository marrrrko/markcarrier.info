#!/bin/bash

docker run \
    -d -p 8000:8000 \
    -v $(pwd)/dynamo-test-data:/data/ \
    amazon/dynamodb-local \
    -jar DynamoDBLocal.jar -sharedDb -dbPath /data
