import * as fs from 'fs'
import * as util from 'util'
import * as childProcess from 'child_process'
import chalk, { Chalk } from 'chalk'
import { ApolloConfig, GatewayConfig, ServiceConfig } from './interfaces/apollo-config'

export const exec = util.promisify(childProcess.exec)
export const access = util.promisify(fs.access)

/**
 * Resolves an absolute path out of multiple path segments.
 */
interface PathResolveFn {
  (...pathSegments: string[]): string
}

/**
 * Asynchronously tests a user's permissions for the file specified by path.
 */
interface AccessFileFn {
  (path: string, mode: number): Promise<void>
}

/**
 * Run a command with space separated arguments.
 */
interface ExecFn {
  (command: string): Promise<{ stdout: string, stderr: string }>
}

/**
 * Gets the path of the apollo.config.js file.
 *
 * Gives the apollo.config.js file in the current working directory if the `configPath` is not provided.
 * If a `configPath` is provided and it is absolute it will simply return the `configPath` as it is assumed the user knew exactly where
 * it was already.
 * If a `configPath` is provided and it is relative it will return the `configPath` relative to the `cwd`.
 *
 * @param pathResolveFn - {@link PathResolveFn}
 * @param cwd - The current working directory.
 * @param configPath - Path to the apollo.config.js file.
 * @returns The absolute path to the apollo.config.js file.
 */
export function getConfigPath (pathResolveFn: PathResolveFn, cwd: string, configPath?: string): string {
  if (!configPath) {
    return pathResolveFn(cwd, 'apollo.config.js')
  }

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
export function getGatewayApolloConfig (pathResolveFn: PathResolveFn, cwd: string, configPath?: string): ApolloConfig<GatewayConfig> {
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
export function getServiceApolloConfig (pathResolveFn: PathResolveFn, cwd: string, configPath?: string): ApolloConfig<ServiceConfig> {
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

function getRandomInt (max: number): number {
  return Math.floor(Math.random() * Math.floor(max))
}
