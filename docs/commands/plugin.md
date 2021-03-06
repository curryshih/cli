# Gok plugin

Scope: `Project`

`Gok plugin` is the command to solve the versioning problem of `protoc-gen-*` plugins.

Detailed documentation is provided [at `github.com/golang/protobuf`](https://github.com/golang/protobuf#generated-code).

A `gok plugin` is a way to register a binary to compile the proto file (and gateway as well) when running `gok build proto` or `gok build gateway` command.
If all team's members register the same binary, then the result will be the same for everyone.
`Gok plugin` forces you to use `plugins` to compile proto file this way and enhances the stability of the source code.

## List

### Command: gok plugin list

List all current plugins use by this project.

## Add

### Command: gok plugin add pluginName

You can run `gok doctor` in the current project to check the name of default plugins.

Alternatively, you can add *any plugin* to the project.
To do this:

- Check `${ProjectRootDir}/vendor/${pluginName}` for the source. If it does not exist, an error is thrown.
- Enter the plugin source, perform `go build` to compile the `protoc-gen-*` binary to the binary folder, defaulting to `${ProjectRootDir/.bin}`
- Write to `root.yaml` to mark that the plugin exists.

#### Example

This is an example of how to add `github.com/gokums/go-proto-validators` into the plugins list:

- Add to the vendor with `dep ensure -add github.com/gokums/go-proto-validators`
- Run `gok plugin add github.com/gokums/go-proto-validators`
- Add to genflags:

```text
    genflags:
      proto:
        optional:
          val: '--govalidators_out=<%=mappings%>:<%=outDir%>'
```

- Now you can generate validators with `gok build proto -val`
