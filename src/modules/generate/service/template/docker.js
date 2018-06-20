module.exports = manifest => `FROM alpine:3.6

RUN apk --no-cache add ca-certificates tzdata && update-ca-certificates

## Create gokums user
RUN addgroup -S gokums && \
  adduser -S gokums -G gokums && \
  mkdir -p /gokums

WORKDIR /gokums

COPY dist/${manifest.service.name} /gokums/${manifest.service.name}

RUN chown -R gokums:gokums /gokums

USER gokums
`;
