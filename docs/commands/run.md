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

### Service dependency and inter-service communications

`Gok run` allows you to specify dependencies of a service in the `metadata.tasks.run.deps`, the below is an example of two services depend to eachother: service frontend depends on service backend to provide data

```YAML
# frontend/manifest.yaml
metadata:
    vars:
        port: <%=tools.next('service', 1000)%>
        expose_url: localhost/frontend
    tasks:
        run:
            steps:
                - cmd: echo backend start on <%=refs.backend.expose_url%>:<%=refs.backend.port %>
                - cmd: echo frontend start on <%=vars.expose_url%>:<%=vars.port%>
            deps:
                - backend
```

```YAML
# backend/manifest.yaml
metadata:
    vars:
        port: <%=tools.next('service', 1000)%>
        expose_url: localhost/backend
    tasks:
        run:
            steps:
                - cmd: echo backend start on <%=vars.expose_url%>:<%=vars.port %>
```

Invoking `gok run frontend` will go through the following step:

- `Gok` checks dependencies for `frontend` and find out that he needs to start `backend` first.
- `Gok` checks dependencies for `backend` and find none, therefore, he starts generating `metadata.vars` for backend by merging both from `root.yaml`, and `manifest.yaml`. After that `Gok` performs templating on `metadata.vars`
- `Gok` run steps in `backend` by templating the command and execute it.
- After successfully start `backend`, `Gok` comes back and generates `metadata.vars` by the same how it geneartes for backend
- After that `Gok` starts `frontend` service by templating the run steps and execute it.

If you're curious about the `tools.next()`, please refer to [Task command](task.md)