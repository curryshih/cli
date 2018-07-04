# Gok generate

Scope: `Global`, `Project`

`Gok generate` provides boilerplate to generate projects, services, and proto.
Refer to [Gokums convention](../others/conventions.md) file for more information.

## Project

Scope: `Global`, `Project`

### Command: gok generate project packagePath

Generate a `Gokums Project` into folder `$GOPATH/src/${packagePath}`. The package can be nested like `github.com/gokums/sample`.

`Gok` performs the following tasks:

- Clone [Gokums boiler](https://github.com/gokums/boiler) into project root folder `$GOPATH/src/${packagePath}`.
- Execute `dep ensure` in root folder to install dependencies into `$GOPATH/src/${packagePath}/vendor`.
- Generate configuration file `$GOPATH/src/${packagePath}/root.yaml`.
- Remove current `Git` metadata.
- Populate a local git repo, and prepare git pre-commit hooks.

## Service

Scope: `Project`

### Command: gok generate service serviceName -p packagePath

Generate a service placeholder into service's folder.
The folder of generated service is constructed from the root folder of the project, package and service's name, i.e. `${ProjectRootDir}/${serviceDir}/${packagePath}/${serviceName}`.

`Gok` performs the following tasks:

- Generate and make service folder
- Write default configuration service file (`manifest.yaml`).
- Create `Dockerfile`.
- Populate `main.go`.
- Make `k8s, args, internal/rpc` folders.
- Generate flags and write into `args/flag.go`.

## Proto and Gateway

Scope: `Project`

### Proto Command: gok generate proto protoName

Generate a proto file named `protoName` into the proto folder.
`protoName` is pascalized and lowered case. The file path will be defined as `${ProjectRootDir}/${protoDir}/${protoName}.proto`.
If the file exists, `Gok` will report an error and do nothing.

### Gateway Command: gok generate gateway gatewayName

Similar to the generation of the proto file, only the file path is different: `${ProjectRootDir}/${gatewayDir}/${gatewayName}.proto`;
