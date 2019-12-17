FROM node:10-alpine

RUN apk update
RUN apk add bash

#Switch to bash
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

WORKDIR /app
ADD . /app

RUN npm install
RUN npm run build

ENTRYPOINT ["node","server.js"]