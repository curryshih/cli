## Gok doctor

`Gok doctor` is the command that checks and verifies the current system, to make sure your system is ready, and create less error when `gokking`. Below is the list of checked items.

### Gok version

`Gok` visits the remote version on GitHub and compare with your current version, if it does not match, Gok will inform you to update.

### Node version

`Gok` is written with `node 8`. Hence you need the same version to run its tools. `Gok doctor` will check current node version of your system and tell you to use node version more than 8.0

### Golang version

`Gok` is made for `Golang` and uses it as the main language, `Gok doctor` will check if there is any go in your system and will complain if it doesn't have.

### Gcloud and Kubernetes

`Gcloud` and `kubectl` are advised to be installed to take advantage of the advance feature of `Gok`, however, you don't need at the beginning. You only need if you want to deploy to Gcloud.

### Protoc and its plugins

`Gok` uses `protobuf` as default. Therefore `protoc` is required. If you're already created and are inside a project, `Gok` will check `plugins` those generate code from `proto` file.

### Git and docker

`Git` and `Docker` are essential and necessary for all kinds of action, and are required to run `Gok`.

### Golang Package Dependency management tool

`Dep` is required for `Gok`, please install it.
