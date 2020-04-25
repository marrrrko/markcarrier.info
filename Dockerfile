FROM node:10-alpine

RUN apk update
RUN apk add bash
RUN apk add git
RUN apk add curl
RUN apk add jq

#Switch to bash
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

#NPM Dependencies (split for caching performance)
COPY package.json /tmp/package.json
RUN export MAXMIND_LICENSE_KEY="qAmlvLbThW519p1I"
RUN echo "Key = $MAXMIND_LICENSE_KEY"
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

WORKDIR /app
ADD . /app

RUN npm run build

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node","server.js"]
