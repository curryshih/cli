### Gok flag

Scope: `Service`

`Gok flag` allows you to manage all parameters to your service from the command line. You can `list`, `add`, `remove` and `spawn` flags in your service. All `flag` commands belong to the service scope, and `Gok` will complain if you are not in any service.

### List

##### Command: gok flag list

This is default command of `flag`, you can simple type `gok flag` or even shorter: `gok f`(refer to [alias](../others/alias.md).
This command lists out all detail flags of current service. Two default flags of any generated service are:
```
NAME                   TYPE       DEFAULT            USAGE
rpc-bind               String     9009               port to bind rpc
http-bind              String     9019               port to bind http
```

### Add

##### Command: gok flag add name -t Type -v defaultValue -u usage
##### Sample:

`gok flag add host -t String -v "127.0.0.1" -u "This is your host"`

`Type` is default to `String` and can be one of the following:

```
'String', 'Int', 'Int64', 'Bool', 'Float64', 'Duration', 'Uint', 'Uint6'
```

This command will add the flag's metadata into `metadata.flags` of the `manifest.yaml`, then respawn flags in `serviceRoot/args/flag.go`.

If you attempt to re-add a flag, the new one will overwrite the old one.

### Remove

##### Command: gok flag remove name

This command removes the flag's metadata out of `metadata.flags` of the `manifest.yaml`, then respawn flags in `serviceRoot/args/flag.go`.

### Spawn

##### Command: gok flag spawn

`Spawn` reads all flags from `metadata.flags` of the `manifest.yaml` and then respawn the flags in `serviceRoot/args/flag.go`.


