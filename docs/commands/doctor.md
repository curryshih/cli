# Gok doctor

Scope: `Global`, `Project`

`Gok doctor` is the command that checks and verifies the current system, to make sure your system is ready, and reduce potential errors when run `Gok`.
Below is the list of checked items.

When invoked inside a project, `Gok doctor` checks the `dependencies` of the project with `dep` tool, and the status of protobuf plugins as well.

## Gok version

`Gok` visits the remote version on GitHub and compares with your current version.
If it does not match, Gok will inform you to update.

## Node version

`Gok` is written with `node 8`. Hence you need the same version to run its tools.
`Gok doctor` will check current node version of your system and tell you to use node version more than 8.0

## Golang version

`Gok` is made for `Golang` and uses it as the main language, `Gok doctor` will check if there is any `go` in your system.

## Gcloud and Kubernetes

`Gcloud` and `kubectl` are advised to be installed to take advantage of the advance feature of `Gok`.
Hhowever, you don't necessarily need when you start your development.
You only need if you want to deploy to Gcloud.

## Protoc and its plugins

`Gok` uses `protobuf` as default. Therefore `protoc` is required.
If you're already created and are inside a project, `Gok` will check `plugins` those generate code from `proto` file.

## Git and docker

`Git` and `Docker` are essential and necessary actions required to run `Gok`.

## Golang Package Dependency management tool

`Dep` is required for `Gok`.
