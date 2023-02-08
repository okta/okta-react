[Hygen]: http://www.hygen.io/
[Gulp]: https://gulpjs.com/

# Generator

This generator submodule leverages [Hygen][] and [Gulp][] to manage samples and test-harness app generation.

## Concepts

### Hygen generator

[Hygen][] is a scalable code generator developed based on [ejs](https://github.com/mde/ejs). It locates all templates under `_templates` folder and maps folder structure to the command structure. See details [here](https://github.com/jondot/hygen/#scratch-your-own-itch).

### Gulp task manager

[Gulp][] is one layer on top of the [Hygen][] generator that orchestrates the whole codegen flow. The `default` task runs all generators in parallel.

Other exported tasks:

- generate:samples

- dev:samples

- generate:test-harness

## Templates structure

As mentioned in the [Hygen generator](#hygen-generator) section, each direct subdirectorie under `_templates` are [generators](http://www.hygen.io/docs/generators/), it contains templates for a specific module.

- env: generates env module to load environment variables

- samples: contains all samples templates, during code generation, it renders templates from folders other than `overwrite` first, then renders overwrite templates to generate the final samples.

- test-harness: contains templates for the test harness app

## How to make changes

**Note:** dev mode is avaiable for sample development, try `yarn dev:samples`.

### Change a file

Template name follows the generated file name with `.t` suffix to distinguish the template files from the generated files. When changes are needed, you can search the template file in the IDE, then make changes accordingly.

### Add a new sample

- add config to `config.js`, you may want to add the `type` and `excludeAction` fields based on if the sample belongs to `doc-sample` or `github-sample`.

- start `dev:samples` task by running `yarn dev:samples`

- add templates under `_templates/samples`

- add e2e tests to protect the newly added sample under @okta/test.e2e-samples

## Commands

### Generate all templates

```bash
yarn generate
```

### Run gulp task

```bash
yarn gulp {taskName}
```

