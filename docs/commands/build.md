### Gok build

`Gok build` is a tool to compile services and proto. If you did not take a look at [Gokums convention](../others/conventions.md), have a peek yourself.

### Service

Scope: `Project`

##### Command: gok build service serviceName

Build the binary of service with provided `serviceName`, if you don't provide the service, `Gok` builds all services inside your project. You can add the flag `-parallel` to build multiple services parallelly.

`Gok` performs the following tasks in order, to build a project:

- Check the gitSHA of your latest commit, then assign a ldflag to inject the version into source codes
- Perform a `go build main.go` in the root folder of the targeted service, also specify output binary file to `.build/${serviceName}`

### Proto and Gateway

Scope: `Project`

Th building process of proto and gateway heavily interact with `protoc` and `protoc-gen-*` plugins. For detail configuration, refer to [root.yaml configuration](../others/root.yaml.md)

##### Proto Command: gok build proto [protoName...] [-genflag...]

If `protoName` is absent, `Gok` attempts to build all proto.

Here is the step to build one proto:

- `Gok` check and pull all configurations from `root.yaml`: `paths`, `mappings` and `generators`.
- For each required generator, `Gok` builds command from its template, then includes `paths` and `mappings`. After that, built command is executed.
- For each optional generator, `Gok` check if its name exists in the genflag list. If yes, it performs like a required one.

##### Gateway Command: gok build gateway [gatewayName...] [-genflag]

Building gateway behaves exactly like the way proto works, only output and input directories are different.
