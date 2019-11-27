# apollo-cli-plugin-split-services

Working with the [Apollo CLI](https://www.npmjs.com/package/apollo) is great when working with the apollo toolchain, but when your
creating federated services for a gateway managing all of those services in separate packages can be a pain. This plugin extends the CLI
that Apollo offers out of the box to add commands to help working with split services easier. If you are using a monorepo this project is
not for you, it is for people who split their federated services into different repositories.

## Getting Started

### Prerequisites
You must have the [Apollo CLI] installed preferably as a global package but as a project level dependency is also fine.

### Installing
Run `apollo plugins:install apollo-cli-plugin-split-services`.

This plugin also provides typescript type definitions for working with the apollo.config.js file. If you are interested in using your
apollo.config.js file as typescript simply move the apollo.config.js -> <typescript-src-dir>/apollo.config.ts. When you run the apollo
CLI you can reference your typescript output directory for the config file `apollo <some-command> --config dist/apollo.config.js`. Of
course you will also need to include this project as a dependency if you do so `npm i apollo-cli-plugin-split-services`.

## Commands
<!-- commands -->
* [`apollo services:init`](#apollo-servicesinit)
* [`apollo services:start`](#apollo-servicesstart)
* [`apollo services:status`](#apollo-servicesstatus)

## `apollo services:init`

Clones and installs dependencies for all services listed in your apollo.config.js file.

```
USAGE
  $ apollo services:init

OPTIONS
  -c, --config=config  [default: apollo.config.js] Path to your Apollo config file.
  -h, --help           show CLI help

EXAMPLE
  $ apollo services:init --config dist/apollo.config.js
```

## `apollo services:start`

Start services listed in your apollo.config.js file.

```
USAGE
  $ apollo services:start

OPTIONS
  -c, --config=config  [default: apollo.config.js] Path to your Apollo config file.
  -h, --help           show CLI help

EXAMPLE
  $ apollo services:start --config dist/apollo.config.js
```

## `apollo services:status`

Checks the git status for all services listed in your apollo.config.js file.

```
USAGE
  $ apollo services:status

OPTIONS
  -c, --config=config  [default: apollo.config.js] Path to your Apollo config file.
  -h, --help           show CLI help

EXAMPLE
  $ apollo services:status --config dist/apollo.config.js
```
<!-- commandsstop -->
