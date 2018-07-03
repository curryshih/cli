### Gok generate

Scope: `Global`, `Project`

`Gok generate` provides a boilerplate to generate projects, services, and proto. If you did not take a look at [Gokums convention](../others/conventions.md), have a peek yourself.

### Project

Scope: `Global`, `Project`

##### Command: gok generate project packagePath

Generate a `Gokums Project` into folder `$GOPATH/src/${packagePath}`. The package can be nested like `github.com/gokums/sample`.

`Gok` performs the following tasks in order, to create a project:

- Clone [Gokums boiler](https://github.com/gokums/boiler) into project root folder `$GOPATH/src/${packagePath}`
- Execute `dep ensure` in root folder to install dependencies into `$GOPATH/src/${packagePath}/vendor`
- Generate configuration file `$GOPATH/src/${packagePath}/root.yaml`
- Remove current `Git` metadata
- Populate a local git repo, prepare git pre-commit hooks

### Service

Scope: `Project`

##### Command: gok generate service serviceName -p packagePath

Generate a service placeholder into service's folder. The folder of generated service is combined from the root folder of the project, package and service's name, i.e. `${ProjectRootDir}/${serviceDir}/${packagePath}/${serviceName}`.

`Gok` executes these tasks orderly:

- Generate and make service folder
- Write default configuration service file, the `manifest.yaml`
- Create `Dockerfile`
- Populate `main.go`
- Make `k8s, args, internal/rpc` folders
- Spawn flags into `args/flag.go`

### Proto and Gateway

Scope: `Project`

##### Proto Command: gok generate proto protoName

Generate a proto file named `protoName` into the proto folder. `protoName` is pascalized and lowered case. The file path is fixed with `${ProjectRootDir}/${protoDir}/${protoName}.proto`. If the file exists, `Gok` will complain and do nothing.

##### Gateway Command: gok generate gateway gatewayName

Similar to the generation of the proto file, only the file path is different: `${ProjectRootDir}/${gatewayDir}/${gatewayName}.proto`;
