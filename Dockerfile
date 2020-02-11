FROM node:10-alpine

RUN apk update
RUN apk add bash

#Switch to bash
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

#NPM Dependencies (split for caching performance)
COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

WORKDIR /app
ADD . /app

RUN npm run build

ENTRYPOINT ["node","server.js"]