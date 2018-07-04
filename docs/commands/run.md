# Gok run

## Command: gok run [serviceName...]

`Gok run` provides a tool to bind and run your services together
It allows you to specify dependencies and automatically set up the dependency to your services.

`Run` command uses the `metadata.tasks.run` to build up and run your service

To do this, the following steps are taken:

- Build up dependency graph, and check for circular dependencies. If found an error is thrown and `run` exits.
- Starting with non-dependent services first, each is run.
- Next, services with dependancies are started.

`Run` also provides an interactive console to kill or restart a service.
After successfully started a service, all dependent services will have `.kill_*` and `.restart_*` commands available in the console.
