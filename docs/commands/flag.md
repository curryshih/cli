# Gok flag

Scope: `Service`

`Gok flag` allows you to manage all parameters to your service from the command line.
You can `list`, `add`, `remove` and `spawn` flags in your service.
All `flag` commands belong to the service scope, and `Gok` will report an error if you are not in any service scope.

## List

### Command: gok flag list

This is default command of `flag`.
You can type `gok flag` or even shorter: `gok f` (refer to [alias](../others/alias.md).
This command lists out all flags of current service.

Two default flags of any generated service are:

```text
NAME                   TYPE       DEFAULT            USAGE
rpc-bind               String     9009               port to bind rpc
http-bind              String     9019               port to bind http
```

## Add

### Command: gok flag add name -t Type -v defaultValue -u usage

#### Sample

`gok flag add host -t String -v "127.0.0.1" -u "This is your host"`

`Type` defaults to `String`

Valid options are:

- `String`
- `Int`
- `Int64`
- `Bool`
- `Float64`
- `Duration`
- `Uint`
- `Uint6`

This command will add the flag's metadata into `metadata.flags` in `manifest.yaml`, and then rebuilds the flags to `serviceRoot/args/flag.go`.

If you attempt to re-add a flag, the new one will overwrite the old one.

## Remove

### Command: gok flag remove name

This command removes the flag's metadata from `metadata.flags` in `manifest.yaml`, then rebuilds the flags in `serviceRoot/args/flag.go`.

## Spawn

### Command: gok flag spawn

`Spawn` reads all flags from `metadata.flags` in `manifest.yaml` and rebuilds the flags in `serviceRoot/args/flag.go`.
