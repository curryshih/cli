FROM brio/alpine-go-node:go-1.9-node-8.11.2

RUN apk update && apk upgrade \
  && apk add --no-cache ca-certificates

RUN npm install gokums-cli@1.1.10 -g --production

RUN mkdir -p /go
ENV GOPATH /go
ENV PATH $PATH:$GOPATH/bin
