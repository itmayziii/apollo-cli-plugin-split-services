import * as fs from 'fs'
import * as util from 'util'
import * as childProcess from 'child_process'
import chalk, { Chalk } from 'chalk'
import { ApolloConfig, GatewayConfig, ServiceConfig } from './interfaces/apollo-config'
import * as Parser from '@oclif/parser'
import { Command } from '@oclif/command'

export const exec = util.promisify(childProcess.exec)
export const access = util.promisify(fs.access)

/**
 * Resolves an absolute path out of multiple path segments.
 */
export interface PathResolveFn {
  (...pathSegments: string[]): string
}

/**
 * Asynchronously tests a user's permissions for the file specified by path.
 */
export interface AccessFileFn {
  (path: string, mode: number): Promise<void>
}

/**
 * Run a command with space separated arguments.
 */
export interface ExecFn {
  (command: string, options?: childProcess.ExecOptions): Promise<{ stdout: string, stderr: string }>
}

/**
 * Omits the first args from a function, useful for HOF that provide a special first arg.
 */
type OmitFirstThreeArgs<F> = F extends (x: any, y: any, z: any, ...args: infer P) => infer R ? (...args: P) => R : never;

/**
 * Commands usually available through oclif to log to the console or exit the CLI.
 */
export interface CommandReporter {
  exit: typeof Command.prototype.exit
  warn: typeof Command.prototype.warn
  error: typeof Command.prototype.error
  log: typeof Command.prototype.log
}

/**
 * Gets the path of the apollo.config.js file.
 *
 * If a `configPath` is provided and it is absolute it will simply return the `configPath` as it is assumed the user knew exactly where
 * it was already.
 * If a `configPath` is provided and it is relative it will return the `configPath` relative to the `cwd`.
 *
 * @param pathResolveFn - {@link PathResolveFn}
 * @param cwd - The current working directory.
 * @param configPath - Path to the apollo.config.js file.
 * @returns The absolute path to the apollo.config.js file.
 */
export function getConfigPath (pathResolveFn: PathResolveFn, cwd: string, configPath: string): string {
  if (configPath.startsWith('/')) {
    return configPath
  }

  return pathResolveFn(cwd, configPath)
}

/**
 * Checks if a path exists and is accessible.
 *
 * @param accessFileFn - {@link AccessFileFn}
 * @param aPath - Path to the file or directory.
 * @returns Whether or not a path exists and is accessible.
 */
export function pathExists (accessFileFn: AccessFileFn, aPath: string): Promise<boolean> {
  return accessFileFn(aPath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

/**
 * Checks if a directory is a javascript project.
 *
 * @param accessFileFn - {@link AccessFileFn}
 * @param pathResolveFn - {@link PathResolveFn}
 * @param directory - path to directory to check if it is a javascript project.
 * @returns Whether or not the `directory` is a javascript project.
 */
export function isJavascriptProject (accessFileFn: AccessFileFn, pathResolveFn: PathResolveFn, directory: string): Promise<boolean> {
  return pathExists(accessFileFn, pathResolveFn(directory, 'package.json'))
}

/**
 * Clones a repository from a URL.
 *
 * @param execFn - {@link ExecFn}
 * @param gitURL - URL of the git repo.
 * @param directory - Optionally name the directory the repo should be cloned to.
 * @returns The output of stdout and stderr from the child process.
 */
export function cloneRepo (execFn: ExecFn, gitURL: string, directory?: string): Promise<{ stdout: string, stderr: string }> {
  const command = directory ? `git clone ${gitURL} ${directory}` : `git clone ${gitURL}`
  return execFn(command)
}

/**
 * Gets the apollo.config.js file meant for a gateway and verifies it is valid.
 *
 * @param pathResolveFn - {@link PathResolveFn}
 * @param cwd - The current working directory.
 * @param configPath - Path to the apollo.config.js file, can be absolute or relative (to the `cwd`).
 * @returns The apollo configuration specific to the gateway or one of the split services.
 * @throws Error - When the apollo.config.js file does not exist or is invalid.
 */
export function getGatewayApolloConfig (pathResolveFn: PathResolveFn, cwd: string, configPath: string): ApolloConfig<GatewayConfig> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apolloConfig: Partial<ApolloConfig<GatewayConfig>> = require(getConfigPath(pathResolveFn, cwd, configPath))
  if (!apolloConfig.splitServices) {
    throw new Error('apollo.config.js is missing a "splitServices" key')
  }

  if (!apolloConfig.splitServices.services) {
    throw new Error('apollo.config.js is missing a "splitServices.services" key')
  }

  apolloConfig.splitServices.services.map(function verifyApolloServiceConfig (service) {
    if (!service.gitURL || !service.name || !service.directory) {
      throw new Error('apollo.config.js is missing a "gitURL", "name", or "directory" property.')
    }
  })

  return apolloConfig as ApolloConfig<GatewayConfig>
}

/**
 * Gets the apollo.config.js file meant for a service and verifies it is valid.
 *
 * @param pathResolveFn - {@link PathResolveFn}
 * @param cwd - The current working directory.
 * @param configPath - Path to the apollo.config.js file, can be absolute or relative (to the `cwd`).
 * @returns The apollo configuration specific to the gateway or one of the split services.
 */
export function getServiceApolloConfig (pathResolveFn: PathResolveFn, cwd: string, configPath: string): ApolloConfig<ServiceConfig> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apolloConfig: Partial<ApolloConfig<ServiceConfig>> = require(getConfigPath(pathResolveFn, cwd, configPath))
  if (!apolloConfig.splitServices) {
    throw new Error('apollo.config.js is missing a "splitServices" key')
  }

  if (!apolloConfig.splitServices.url) {
    throw new Error('apollo.config.js is missing a "splitServices.url" key')
  }

  return apolloConfig as ApolloConfig<ServiceConfig>
}

/**
 * Sets up common data needed by command functions like the apolloConfig and an object to log to the console with through the CLI.
 * The main driver for this function is allow us to easily use functions instead of Oclifs classes. It is impossible to pass
 * dependencies to those Oclif classes therefore making testing a nightmare using global dependency rewiring like proxyrequire or rewire.
 *
 * @param commandInstance - Instance of an {@link Command}
 * @param parsedOutput - Output of calling this.parse(Command) from an Oclif command.
 * @param fn - Function that common config should be passed to and will take over the actual work of running the command logic.
 * @param pathResolver - {@link PathResolveFn}
 * @param cwd - The current working directory.
 */
export function withCommonGatewaySetup<
    I extends Command,
    T extends Parser.Output<any, any>,
    F extends (apolloConfig: ApolloConfig<GatewayConfig>, reporter: CommandReporter, parsedOutput: T, ...args: any[]) => Promise<any>
  >
(commandInstance: I, parsedOutput: T, fn: F, pathResolver: PathResolveFn, cwd: string): (...funcArgs: Parameters<OmitFirstThreeArgs<F>>) => Promise<any> {
  const apolloConfig = getGatewayApolloConfig(pathResolver, cwd, parsedOutput.flags.config)
  const reporter: CommandReporter = {
    exit: commandInstance.exit,
    warn: commandInstance.warn,
    error: commandInstance.error,
    log: commandInstance.log
  }
  return (...args: Parameters<OmitFirstThreeArgs<F>>): Promise<any> => fn(apolloConfig, reporter, parsedOutput, ...args)
}

/**
 * Returns a random color for logging.
 *
 * @returns A random {@link Chalk} color.
 */
export function randomLogColor (): Chalk {
  const colors = [
    chalk.blue,
    chalk.green,
    chalk.cyan,
    chalk.magenta,
    chalk.yellow,
    chalk.red
  ]

  return colors[getRandomInt(6)]
}

/**
 * Get a random integer.
 *
 * @param max - Max integer value to return up to but not including this number.
 * @return A random integer.
 */
function getRandomInt (max: number): number {
  return Math.floor(Math.random() * Math.floor(max))
}
