## Gok navigate
Scope: `Global`, `Project`, `Service`

`Gok navigate` is the tool that helps you navigate through projects and services.

### Setup

##### Scope: Global

##### Command: gok navigate setup

`setup` prints out a helper function called `gokto` that help you navigate with ease. All you need to do is add this helper to your `.bashrc` or `.bash_profile` depends on your terminal.

```
gok navigate setup > ~/.bashrc
source ~/.bashrc
```

And now you can use
```
gokto project-name
gokto service-name
```

See how `gokto` behaves in `To` command.

### To

##### Command: gok navigate to [target]
##### Command with tool: gokto [target]

The `gokto` helpers mostly use this command, it prints out the path to project or service depend on your scope.

##### Scope: Global

Navigate you to the project that which has `target` a part of its name. If you have more than one, `gok` will raise an error and do nothing.

##### Scope: Project

If you don't provide a target, it will navigate you to the root folder of your project(the folder contains a valid root.yaml).

`Gok` searches for all services inside your current project and navigate to the service that has `target` in its name. If there are more than two services, `gok` doesn't navigate and inform an error.

If `Gok` cannot find service has `target` in its name, it then falls back to the `Global` scope.

### List

##### Scope: Global, Project

This command prints out a list of projects in your system, or services.

##### Command: gok navigate list [project|service]

Default to `project`.

If you try with `service` but not located inside a `Project scope`, `Gok` will throw an error.