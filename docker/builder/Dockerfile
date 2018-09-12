FROM brio/alpine-go-node:go-1.9-node-8.11.2

RUN apk update && apk upgrade \
  && apk add --no-cache ca-certificates python

RUN addgroup -S gok && adduser -S gok -G gok && mkdir -p /gok

RUN chown -R gok:gok /usr/lib/node_modules

USER gok

RUN npm install gokums-cli@1.2.14 -g --production --no-bin-links

RUN mkdir -p /go
ENV GOPATH /go
ENV PATH $PATH:$GOPATH/bin
