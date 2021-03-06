# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.1.5](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v2.1.4...v2.1.5) (2020-02-17)



## [2.1.4](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v2.1.3...v2.1.4) (2020-02-10)



## [2.1.3](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v2.1.2...v2.1.3) (2019-12-11)


### Bug Fixes

* **docker-network-prerun:** now try/catching an error that gets thrown when not config exists ([6af34fd](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/6af34fd))



## [2.1.2](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v2.1.1...v2.1.2) (2019-12-11)


### Bug Fixes

* **docker-network-prerun-hook:** hook did not have default parameters for flags like a command would ([5806e52](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/5806e52))



## [2.1.1](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v2.1.0...v2.1.1) (2019-12-11)



# [2.1.0](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v2.0.0...v2.1.0) (2019-12-11)


### Features

* **docker network hook:** added a prerun hook that creates a docker network if apollo config has it ([d423fe7](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/d423fe7))



# [2.0.0](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.5.1...v2.0.0) (2019-12-02)


### Features

* **apollo.config:** changed the expected config setting in apollo.config ([cb33236](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/cb33236))
* **servicesstart:** moved over services:start command logic to a function for testability ([e4946b0](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/e4946b0))


### BREAKING CHANGES

* **apollo.config:** Apollo.config.splitServices.directory is expected to be the full relative directory
name and this package will no longer assume that services are in a "services" directory.



## [1.5.1](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.5.0...v1.5.1) (2019-11-22)


### Bug Fixes

* **helpers:** we were checking for incorrect properties in the config ([0fd06f4](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/0fd06f4))



# [1.5.0](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.4.0...v1.5.0) (2019-11-22)


### Bug Fixes

* **helpers:** using new interface names ([1432728](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/1432728))


### Features

* **interfaces:** renamed interfaces one more time, settled on a top level splitServices key ([670d23e](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/670d23e))



# [1.4.0](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.3.1...v1.4.0) (2019-11-22)


### Bug Fixes

* **apolloconfig interface:** switched all use of the old interfaces to the new ones ([61b9c71](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/61b9c71))


### Features

* **services:start:** added a services:start command and changed the config interface names ([78a3115](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/78a3115))



## [1.3.1](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.3.0...v1.3.1) (2019-11-22)


### Bug Fixes

* **package.json:** fixed "main" property to point to the right dist/index.js file ([387038b](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/387038b))



# [1.3.0](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.2.2...v1.3.0) (2019-11-22)


### Features

* **index.ts:** barrel file for package exports, this library will export interfaces for users ([457707f](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/457707f))



## [1.2.2](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.2.1...v1.2.2) (2019-11-21)


### Bug Fixes

* **helpers:** fixed off by one error with colors ([39f71ad](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/39f71ad))



## [1.2.1](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.2.0...v1.2.1) (2019-11-21)


### Bug Fixes

* **helpers:** fixed the colors being limited to only the first 3 values ([5945d9a](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/5945d9a))



# [1.2.0](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.1.4...v1.2.0) (2019-11-21)


### Features

* **services:status:** added a services:status command that runs git status on all services ([84107ee](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/84107ee))



## [1.1.4](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.1.3...v1.1.4) (2019-11-13)


### Bug Fixes

* **tsconfig.json:** fixed compilation module to be commonJS ([944695c](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/944695c))



## [1.1.3](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.1.2...v1.1.3) (2019-11-13)



## [1.1.2](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.1.1...v1.1.2) (2019-11-13)



## [1.1.1](https://github.com/itmayziii/apollo-cli-plugin-split-services/compare/v1.1.0...v1.1.1) (2019-11-12)



# 1.1.0 (2019-11-12)


### Features

* **apollo.config.js:** now prompting for the config file location ([baf65d7](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/baf65d7))
* **initial commit :rocket::** added init command to git clone services and install deps ([a0fdb37](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/a0fdb37))
* **service:init:** now checking for service directory before cloning ([f258d79](https://github.com/itmayziii/apollo-cli-plugin-split-services/commit/f258d79))
