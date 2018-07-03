## Gok run

##### Command: gok run [serviceName...]

`Gok run` provides a great tool to bind and run your services together, it allows you to specify dependency and automatically set up and wired up the dependency to your service.

`Run` command uses the `metadata.tasks.run` to build up and run your service, and it works like this:

- Build up dependency graph, and check for circular dependency, throw an error and exit if found.
- It starts with non-dependency services first, running those service and start with other services.

`Run` also provides an interactive console to kill or restart a service with ease. After successfully started a service, all dependent services will have `.kill_*` and `.restart_*` attaches to the console.