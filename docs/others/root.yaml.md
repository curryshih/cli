# Project configuration

`root.yaml` is the configuration file contains all key settings of a project. Below is a typical sample of this file. Refer to [Templating](templating.md) document for more information.

```yaml
project: sample-project
package: github.com/gokums/sample
createdAt: 2018-03-22T08:32:27.425Z
metadata:
  vars:
    gcloudDocker: gcr.io/gokums
  tasks:
    build:
      steps:
      - cmd: go build -i -o ".build/<%=service.name%>" main.go
    run:
      steps:
      - cmd: go build -i -o ".build/<%=service.name%>" main.go
      - cmd:
        - ".build/<%=service.name%>"
        - "-http-bind=localhost:<%=tools.next('http',3001)%>"
        - "-rpc-bind=localhost:<%=tools.next('rpc',13001)%>"
      env:
        environment: local
    gcloud-push:
      steps:
      - cmd: gcloud docker -- push <%=vars.gcloudDocker%>/<%=service.name%>:<%=project.gitSHA%>
config:
  proto:
    paths:
      - proto/x/google.com/proto
      - vendor/github.com/gokums/go-proto-validators
    mappings:
      validator.proto: github.com/gokums/go-proto-validators
      google/api/annotations.proto: google.golang.org/genproto/googleapis/api/annotations
    plugins:
      - github.com/golang/protobuf/protoc-gen-go
      - github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway
      - github.com/gokums/go-proto-validators/protoc-gen-govalidators
    genflags:
      proto:
        required:
          - '--go_out=<%=mappings%>,plugins=grpc:<%=outDir%>'
        optional:
          val: '--govalidators_out=<%=mappings%>:<%=outDir%>'
      gateway:
        required:
          - '--go_out=<%=mappings%>,plugins=grpc:<%=outDir%>'
          - '--grpc-gateway_out=logtostderr=true:<%=outDir%>'
        optional:
          val: '--govalidators_out=<%=mappings%>:<%=outDir%>'
          swag: '--swagger_out=<%=mappings%>:docs/swagger'
  dirs:
    proto: proto
    gateway: proto/gateway
    service: src/service
    genproto: src/proto
    gengateway: src/proto/gateway
    bin: .bin
```

Let's dive deep into each setting:

## Project-wise

```yaml
project: sample-project
package: github.com/gokums/sample
createdAt: 2018-03-22T08:32:27.425Z
```

#### project: sample-project

This is where set the name of the project, which `gokto` looks at when navigating to the project. In this example, you can use `gokto sample-project` to go to its root directory. If there is not any project named with `sample` inside, `gokto sample` can also do the same job.

#### package: github.com/gokums/sample

The package is the `packagePath` when you generate the project with `gok generate project packagePath`, it's the path from `$GOPATH` to the root directory of the project. If you happen to change the path of the project, please update it as well. Also, you can use `gok yml` to update it with:

`gok yml w -i root.yaml -o root.yaml package github.com/gokums/another-sample`

#### createdAt: 2018-03-22T08:32:27.425Z

This is the recorded timestamp when you created this project, nothing special about this attribute.

## Metadata

`metadata` is the only object that will be merged between `Project` scope and `Service` scope. Meaning that if you perform a task or a command depend on the `metadata` in the `Project` scope, it is the one in your `root.yaml`, otherwise, if you are in the `Service` scope, the same data will be merged from `root.yaml` and `manifest.yaml`

### Vars

```yaml
metadata:
  vars:
    gcloudDocker: gcr.io/gokums
    relativePaths:
      main: .build/<%=project.package%>
```

`Vars` is the commonplace you can define variables of the project and use it in other settings. You can use `template` here, and please refer to [Templating](templating.md) for more detail. Also, you can use `vars` as one of templating variable in other places. For example, in the full sample of `root.yaml`, `metadata.tasks.gcloud-push` uses `<%=vars.gcloudDocker%>` in their template.

### Tasks:

```yaml
metadata:
  tasks:
    build:
      steps:
      - cmd: go build -i -o ".build/<%=service.name%>" main.go
    run:
      steps:
      - cmd: go build -i -o ".build/<%=service.name%>" main.go
      - cmd:
        - ".build/<%=service.name%>"
        - "-http-bind=localhost:<%=tools.next('http',3001)%>"
        - "-rpc-bind=localhost:<%=tools.next('rpc',13001)%>"
      env:
        environment: local
    gcloud-push:
      steps:
      - cmd: gcloud docker -- push <%=vars.gcloudDocker%>/<%=service.name%>:<%=project.gitSHA%>
```

The full structure of a task:

```yaml
metadata:
  tasks:
    taskName:
      steps:
        - name: A list script
          cmd: ls . -lart
          when: <%= env.flg === 'yes' %>
      env:
        flg: 'yes'
```

#### steps

`Steps` is an array of sub-task, those are executed one by one top down the list. Step has 3 properties: `name`, `cmd` and `when`. Two of the three, `cmd`, and `when` will be templated before getting executed.

##### name
`name` is optional, and will be logged when executes by `gok task run taskName`. If `name` is not set, `cmd` will be log instead.

##### cmd
`cmd` is required, and can be a string or an array. If `cmd` is an array, it will be concatenated into a string, and templated before getting executed.

##### when
`when` is optional, refer to conditions whether this step is executed or not.
When `when` is a string, it will be templated and evaluated, in these cases, `when` conditions is consider `false` and `cmd` won't be executed:

- `when` return an empty string, example: `when: ''`
- `when` return a false boolean, example: `when: <%= 1 === 2 %b>`
- `when` return a 0 integer, example: `when: <%= 1 - 1 %i>`
- `when` return a 0.0 float, example: `when: <%= 0.00 %f>`

`when` can be an array, in that case, any element in the array is `false` results `false` for the whole `when` condition, and `cmd` won't be executed.


#### env
`Env` is an object of environment variables add in when each step is executed.

### Run tasks

In `metadata.tasks`, all of the tasks are executed with `gok task run taskName`, however, if there is a task named `run`, the service that extends that task can be execute together will all their dependent services. The struct for the `metadata.tasks.run` is a little different with a normal task:

```yaml
metadata:
  tasks:
    run:
      deps:
        - svc1
        - svc2
      steps:
        - name: A list script
          cmd: ls . -lart
        - cmd: ./build/<%=service.name
      env:
        log: info
```

There are two extra rules compare with an invocation of a regular task.

#### Dependency declaration

You can declare dependencies as an array for a service at `metadata.tasks.run.deps`, when `gok run service` invoked, `Gok` search for all services in the dependency list, and try to start it first, you can also refer to the `metadata.vars` of other dependencies.

#### Final step

`steps` is a list of sub-task executed in a sequence. It means that a `step` need to stop before the next one gets started. However, in `run` task, the final step is made `asynchronously` on purpose, to make sure that a service can run a daemon type of binary without interfering with other services.

## Config

`config` holds the detail configuration for all commands in `gok`. Remember that `config` not get merged with service configuration file `manifest.yaml`, only `metadata` does.

### Proto

`config.proto` is the configuration affects `gok build proto` and `gok build gateway`.

#### Paths
```yaml
config:
  proto:
    paths:
      - proto/x/google.com/proto
      - vendor/github.com/gokums/go-proto-validators
```

`config.proto.paths` is an array contains all paths to proto in your project, it maps to -I${path} when invoking a `protoc` generate command.

For example, your project uses [Google API common protos](https://github.com/googleapis/api-common-protos) and you add a submodule to `ProjectRootDir/proto/google.com/proto`, then `proto/x/google.com/proto` inside the `paths` helps `protoc` refers to this awesome proto list. You can use `import 'google/api/auth.proto'` right away.

#### Mappings

Mappings is a feature when generating `golang` code for the protobuf, it allows you to map a proto to a different import path/packages.

```yaml
config:
  proto:
    mappings:
      validator.proto: github.com/gokums/go-proto-validators
      google/api/annotations.proto: google.golang.org/genproto/googleapis/api/annotations
```

In this example, all protos that import `validator.proto` will import package `github.com/gokums/go-proto-validators` in its generated code.

#### Plugins

`config.proto.plugins` stores the list of local installed plugins. Refer to [gok plugin add](../commands/plugin.md) for detail command.

```yaml
config:
  proto:
    plugins:
      - github.com/golang/protobuf/protoc-gen-go
      - github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway
      - github.com/gokums/go-proto-validators/protoc-gen-govalidators
```

#### genflags

`config.proto.genflags` contains the configuration for `gok build proto` command at `config.proto.genflags.proto`, and `gok build gateway` command at `config.proto.genflags.gateway`. Refer to [Templating](templating.md) for more detail on advance usage of this settings.

`config.proto.genflags.*.required` is an array and will be added to the respective command when invoked.

`config.proto.genflags.*.optional` is an array and only be added to the respective command when invoked with the `flag`.

For example, we have the following settings

```yaml
config:
  proto:
    genflags:
      proto:
        required:
          - '--go_out=<%=mappings%>,plugins=grpc:<%=outDir%>'
        optional:
          val: '--govalidators_out=<%=mappings%>:<%=outDir%>'
      gateway:
        required:
          - '--go_out=<%=mappings%>,plugins=grpc:<%=outDir%>'
          - '--grpc-gateway_out=logtostderr=true:<%=outDir%>'
        optional:
          val: '--govalidators_out=<%=mappings%>:<%=outDir%>'
          swag: '--swagger_out=<%=mappings%>:docs/swagger'
```

`gok build proto -val` will invoke both `protoc-gen-go` and `protoc-gen-govalidator` in `.bin` directory.
While `gok build proto` will only invoke `protoc-gen-go`.

### Directory

This configuration allows you to config the directories that you want to use instead of default name.

```yaml
config:
  dirs:
    proto: proto
    gateway: proto/gateway
    service: src/service
    genproto: src/proto
    gengateway: src/proto/gateway
    bin: .bin
```