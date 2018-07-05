# Templating

Templating is uses inside configuration to give it more flexibility. Template compile inline javascript and render complicated logic in various form.

## Basic templating format

Templating format can be describe as simple as the following regex:

`/<%[-=](.*)%([ifbIFB]?)>/`

### Interpolation

You can use `<%= ... %>` to interpolate values.
If you want to interpolate an HTML-escaped data, `<%- ... ->` is there for you to use.

### Arbitrary

You can use the template to run an arbitrary javascript code and printout instead with `<% n = 'Tonny'; print('Hello' + n) %>`

### After parsing

In a yaml file, you can set result of the templating into `integer`, `boolean` or `float` instead of the default string. To acchieve that, the template must be a top layer result, for example:

```
metadata:
  vars:
    integer: <%= 1 %i>
    boolean: <%= 1 %b>
    float: <%= 1.0 %f>
    other: Hello <%= name %>
```

In the example above, `key` can be parsed into another format instead of a string, while `other` can not.

## Template data

`Gok` provides data you can use in the configuration, depends on `command`, the data will be different.

### Task run

Data in `gok task run`:

```
    project:
        package: String
        name: String
        gitSHA: String
        dirs: Object
        rootDir: String
        rootDirFromGoPath: String
        svcDir: String
        svcDirFromRoot: String
        svcDirFromGoPath: String
    },
    service: Object
    argv: Object
    timestamp: Number
    env: Object
    tools: Object
    os: Object
```

#### Project:

`project.package` is the `root.yaml:package`

`project.name` is the `root.yaml:project`

`project.gitSHA` is the result of `git rev-parse --short HEAD` in the root folder of the project.

`project.dirs` is the `root.yaml:config.dirs`

`project.rootDir` is the absolute path to the root directory of the project.

`project.svcDir` is the absolute path to the root directory of the current service, only available in service scope.

`project.rootDirFromGoPath` is the relative path of the root directory of the project from $GOPATH

`project.svcDirFromRoot` is the relative path of the current service from the project root folder,  and unavailable outside of service scope.

`project.svcDirFromGoPath` is the relative path of the current service from the $GOPATH, and unavailable outside of service scope.

#### Service

Direct copy of the `manifest.yaml.service`

#### Argv

Arguments of the invoked gok command

##### Parameters and flags

`argv._` is the array of all parameters
Other flags are included in `argv` itself.

Example:

`gok task run foo bar baz -x 3 -y 4 -n5 -abc --beep=boop`

Results
```yaml
argv:
  _: [task, run, foo, bar, baz]
  x: 3
  y: 4
  n: 5
  a: true
  b: true
  c: true
  beep: boop
```

#### Timestamp

The second Unix timestamp of the moment the command got executed.

#### Environment variable

`env` is the object let you access to the environment variables

Example:

```
cluster=prod gok task run sampleTask
```

Will set `env.cluster` to `prod`

#### Tools

`tools.next(number)` provide the generator for templating.

In the case of `gok run`, each service need a unique number for HTTP and TCP port to listen to. `tools.next` provides an easy solution for this case.

#### os

`os.arch(), os.type(), os.platform()` is the architecture, type and platform of the host

`os.EOL`, like its name said, EOL of the host.

`os.hostname()`, the name of the host, or the computer name

`os.userInfo().username`, name of the user executed the command

`os.homedir()`, the home directory of the user executed the command.

### Build

Data in `gok build proto` or `gok build gateway`:

```
    confDirs: Object
    filename: String
    rootDir: String
    target: String
    outDir: String
    plugins: String
    paths: String
    mappings: String
```

`confDirs` is the `root.yaml:config.dirs`

`filename` is the target proto file, starting from `confDirs.proto` if it is invoked by `gok build proto`, or `confDirs.gateway` in the case of `gok build gateway`

`rootDir` is the root directory of the current project

`target` is either `proto` or `gateway` depends on the invoked command.

`outDir` is the src folder from `$GOPATH`, i.e. `$GOPATH/src`

`plugins` is the concatenation of the list of binary plugins in `confDirs.bin` or `.bin` as default. This option is tailored toward the `protoc-gen-*` plugin format.

`paths` is the join of all proto including paths in `config.proto.paths`, tailored to the format of the protoc's plugins.

`mappings` is the combined of all mappings in `config.proto.mappings`,  tailored to the format of the protoc's plugins.

