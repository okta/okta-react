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

// TODO

## How to make changes

// TODO

## Commands

### Generate all templates

```bash
yarn generate
```

### Run gulp task

```bash
yarn gulp {taskName}
```

### Run commands from the root level of the repo

```bash
yarn workspace @okta/generator {script}
```
