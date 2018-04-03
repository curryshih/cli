# Usage Guidance

## Create a new project

The `generate` command will be used to create the basic project, derived from the standard template structure.

Note, the `generate` command can be abbreviated to `g`. This also assumes GitHub is the repository for code, and therefore the path follows `golang` conventions.

```shell
cd $GOPATH/src
gok g project github.com/orgname/projectname
cd phoenix-activity-publish
git remote add origin git@github.com:orgname/projectname.git
git push -u origin master
```

## Generate Interface specifications

See `Generate Gateway` below for specific Proto generation details for API Gateway services.

### Define specification

[Protobuf](https://github.com/google/protobuf) `proto` files are used to define the interfaces for deployable components.

Assumption: These commands are executed from the root project directory.
In the example created above, that will be `$GOPATH/src/github.com/orgname/projectname`.

```shell
gok g proto protoname
```

This will create a subdirectory containing the `proto` file which can be updated with your specifications.
Note, there is additional commenting in the `proto` file which explains how to configure optional proto validations.

### Generate `golang` files

The `build` command (aliased to `b`) is used to compile `proto` files into the necessary `golang` source.

```shell

# Build a single proto file
gok b proto protofile
# Build all proto files
gok b proto
# Build a single proto file with validations enabled
gok b proto protofile -v
```

## Generate Gateway

`proto` files will also be used to define a Gateway's API specification.

### Define gateway specification

```shell
gok g gateway gatewayprotofile
```

This will define `proto` file in the `proto\gateway` subdirectory.

This proto can be built in the same way as other proto files, using the `gok b proto` command.

## Create service

This applies to the creation of both Gateway services, or other standard services.

```shell
gok g service servicename
```

This creates a service `golang` code, and associated configurations files in the `src\servicename` subdirectory.

If you wish to logically arrange other services into packages, you can create a service using the following command.

```shell
gok g service servicename1 -p helpers
gok g service servicename2 -p helpers
```

This will create `src\helpers\servicename1` and `src\helpers\servicename2`.

## Other utility tooling

### Project Source navigation

This is done by using the `navigate` command, which is aliased to `nav`.
`projectname` is a project that was previously created using the `generate` command.

```shell
gok nav to projectname
```