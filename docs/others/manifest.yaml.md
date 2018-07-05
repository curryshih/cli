# Service configuration

`manifest.yaml` is the configuration file contains all key settings of a service. Below is a typical sample of this file. Refer to [Templating](templating.md) document for more information.

```yaml
service:
  name: sample-svc
  path: sample-svc
  mysql-host: somewhere_at.rds.amazonaws.com
metadata:
  tasks:
    run:
      steps:
      - cmd: go build -i -o ".build/<%=service.name%>" main.go
      - cmd:
        - ".build/<%=service.name%>"
        - "-http-bind=localhost:<%=tools.next('http',3001)%>"
        - "-rpc-bind=localhost:<%=tools.next('rpc',13001)%>"
      env:
        GOOS: linux
        GOARCH: amd64
  flags:
    rpc-bind:
      type: String
      value: 9009
      usage: port to bind rpc
    http-bind:
      type: String
      value: 9019
      usage: port to bind http
```

Let's dive deep into each setting:

## Service-wise

```yaml
service:
  name: sample-svc
  path: sample-svc
  mysql:
    host: somewhere_at.rds.amazonaws.com
```

#### service.name

This setting is where set the name of the service, which `gokto` looks at when navigating to the service. In this example, you can use `gokto sample-svc` in project scope to go to its service root directory. A simple command like `gokto svc` also works if there is only one service has `svc` in its name.

#### service.path

This attribute is the relative path from the root directory of the project.

#### anything else

`service` is an object can be referred in the template with `service` namespace so that you can add optional data like `service.mysql.host` in this example.

## Metadata

As described in [root.yaml](root.yaml.md), metadata is merged from the project's configuration file `root.yaml` with the service's one, the `manifest.yaml`. The behavior of the merged can be described in all-scenario example:

```
root:
  a: 1
  b: 2
  d:
    a: 1
    b: []
    c:
      test1: 123
      test2: 321
  f: 5
  g: 123
  i: 321
  j:
    - 1
    - 2

service :
  b: 3
  c: 5
  d:
    b:
      first: 'one'
      second: 'two'
    c:
      test2: 222
  e:
    one: 1
    two: 2
  f: []
  g: (void 0)
  h: /abc/g
  i: null
  j:
    - 3
    - 4

mergedResult:
{ a: 1
  b: 3
  d:
    a: 1
      b:
        first: 'one'
        second: 'two'
      c:
        test1: 123
        test2: 222
  f: []
  g: undefined
  c: 5
  e:
    one: 1
    two: 2
  h: /abc/g
  i: null
  j:
    - 3
    - 4
```

### Flags

```yaml
metadata:
  flags:
    rpc-bind:
      type: String
      value: 9009
      usage: port to bind rpc
    http-bind:
      type: String
      value: 9019
      usage: port to bind http
```

The place to store the flags of the service, refer to [gok flag](../commands/flag.md) for more info.