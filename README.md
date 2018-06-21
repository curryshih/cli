# Gok (cli)

[![CircleCI](https://circleci.com/gh/gokums/cli/tree/master.svg?style=svg)](https://circleci.com/gh/gokums/cli/tree/master)

## Gok Introduction

`Gok` is a command line based tool to allow [Golang](https://golang.org) developers to create a `project`, within which `golang` services and gateways can be written and configured for deployment to Google's Cloud Platform ([GCP](https://cloud.google.com)), specifically [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/).

The intention is to consolidate [Kubernetes](https://kubernetes.io) configuration for services into a single convention. The aim is to encourage teams to use a single convention to increase productivity and decrease learning curve for new team members.

## CLI Introduction

This repo defines the implementation for the CLI subsystem of Gok. It also serves as the home for usage documentation for the `Gok` tool.

## System Requirements

- Node.js
  - [Direct Install](https://nodejs.org/en/download/)
  - Alternative, Recommendation for MacOS.
    - Install [Homebrew](https://brew.sh)
    - Use Homebrew to install `node-build` and `nodenv` : Refer to [Nodenv](https://github.com/nodenv/nodenv) for instructions.
- Golang
  - [Direct Install](https://golang.org/dl/)
  - Alternative, Recommendation for MacOS.
    - Use Homebrew to install `go`
- gcloud
  - [Installation Guide](https://cloud.google.com/sdk/docs/#install_the_latest_cloud_tools_version_cloudsdk_current_version)
- kubectl
  - [Installation Guide](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- protoc
  - [Installation Guide](http://google.github.io/proto-lens/installing-protoc.html)
  - Alternative, Recommendation for MacOS.
    - Use Homebrew to install `protobuf`
- git
  - For MacOS users, this comes with XCode or the UNIX Command Line tools.
- Docker
  - For MacOS users, recommend installing [Docker Community Edition for Mac](https://store.docker.com/editions/community/docker-ce-desktop-mac).
- Golang dependency manager dep
  - [Installation Guide](https://github.com/golang/dep)
- make
  - For MacOS users, this comes with XCode or the UNIX Command Line tools.

### Operating System

- *nix system such as:
  - Apple MacOS (currently executing on MacOS 10.13.x High Sierra)
  - Linux such as Ubuntu (not officially tested, but *should work*)
  - BSD Unix (not officially tested, but *should work*)
  - etc

Window's users could consider running a VM or installing ["Windows Subsystem for Linux"](https://github.com/Microsoft/WSL).
Note: This is untested, and currently not supported.

### System Dependencies

## Installation

Install the tooling via NPM. It should be installed globally.

Using the terminal, start a new shell of your choice, and enter the following:

```shell
npm i -g gokums-cli
```

### Perform checks

Use the `doctor` command to ensure your system is ready.
Again, via a Terminal shell:

```shell
gok doctor
```

If all is OK, you should see something like:

```text
Checking gokums-cli... You're using latest 1.0.8
Checking Node.js...  version 8.4.0 OK
Checking Golang... go version go1.9.4 darwin/amd64 OK
Checking gcloud...  OK
Checking kubectl...  OK
Checking protoc...  version 3.5.1 OK
Checking git...  OK
Checking docker...  OK
Checking Golang dependency manager dep...  OK
Checking make version...  OK
Checking GOPATH...  OK
Checking protoc-gen-go...  OK
Checking protoc-gen-grpc-gateway...  OK
Checking protoc-gen-govalidators...  OK
```

## Usage

Please refer to [usage guide](docs/usage.md).