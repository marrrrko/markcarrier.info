#!/bin/bash

echo "Retrieving AWS credentials for container."
AWS_JSON="$(curl 169.254.170.2$AWS_CONTAINER_CREDENTIALS_RELATIVE_URI|jq)"
export AWS_ACCESS_KEY_ID="$(echo $AWS_JSON|jq -r .AccessKeyId)"
export AWS_SECRET_ACCESS_KEY="$(echo $AWS_JSON|jq -r .SecretAccessKey)"
export AWS_SESSION_TOKEN="$(echo $AWS_JSON|jq -r .Token)"

exec "$@"