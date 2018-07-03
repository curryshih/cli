## Gokums conventions

### Naming

- Naming should be short, and easy to understand

### Project

- By default, a `Golang` project must always locates inside your `$GOPATH`
- Package(path to project) also starts with a letter, and conform `/^[a-z]([a-z0-9_.-]+\/{0,1})+[a-z]+[a-z0-9]*$/`
- Project is marked by a configuration file `root.yaml`
- `Dep` is the only tool for vendoring dependency, and locate at `vendor` directory in the root folder of the project

### Service

- Service is the short name for a microservice unit in the whole system.
- Service need to be built to run, building a service result in an output binary file.
- Service is built with a `main.go` file located in its root directory.
- Parameters pass to a service in form of flags, to elimilate missing parameter problem. Flags are defined service configuration file `manifest.yaml` an can be generated into `serviceRootDir/args` folder with `gok flag` command.
- All k8s related files should be placed under `serviceRootDir/k8s` folder.
- Hide business logic under `internal` folder as much as possible, to decoupling services
- Service always locates in a subfolder of the project, that folder is default to `ProjectDir/src/service`, but can be configured with `dirs.service` in `root.yaml`
- Service name name starts with a letter, and conform `/^[a-zA-Z]([a-zA-Z0-9]+)$/`
- Service package is similar to project's, starts with letter and conform `/^[a-z]([a-z0-9_.-]+\/{0,1})+[a-z]+[a-z0-9]*$/`
- Service is marked by a configuration file `manifest.yaml`

### Protobuf & GRPC

- Protobuf is default method for serializing the data between inter-service comunication of internal services, that is default to GRPC
- Proto file is divided into two groups, inter-service communication group (proto), and external-service communication group (gateway).
- All proto files are placed in proto folder, which can be configured at `root.yaml` and default to `ProjectRootDir/proto` folder.
- All gateway files are placed in gateway folder, can be configured at `root.yaml` and default to `ProjectRootDir/proto/gateway` folder.
- Gateway proto is usually generated together with `grpc-gateway`, which provides a great tool to bind REST liked calls to the grpc service.