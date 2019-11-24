import * as fs from 'fs'
import * as util from 'util'
import * as childProcess from 'child_process'
import chalk, { Chalk } from 'chalk'
import { ApolloConfig, GatewayConfig } from './interfaces/apollo-config'

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
 * Gets the path of the apollo.config.js file.
 *
 * Gives the apollo.config.js file in the current working directory if the `configPath` is not provided.
 * If a `configPath` is provided and it is absolute it will simply return the `configPath` as it is assumed the user knew exactly where
 * it was already.
 * If a `configPath` is provided and it is relative it will return the `configPath` relative to the `cwd`
 *
 * @param pathResolveFn - {@link PathResolveFn}
 * @param cwd - The current working directory
 * @param configPath - Path to the apollo.config.js file
 * @returns The absolute path to the apollo.config.js file
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

export function isJavascriptProject (accessFileFn: AccessFileFn, pathResolveFn: PathResolveFn, directory: string): Promise<boolean> {
  return pathExists(accessFileFn, pathResolveFn(directory, 'package.json'))
}

export function cloneRepo (gitURL: string, directory?: string): Promise<{ stdout: string, stderr: string }> {
  const command = directory ? `git clone ${gitURL}` : `git clone ${gitURL} ${directory}`
  return exec(command)
}

export function getApolloConfig (pathResolveFn: PathResolveFn, cwd: string, configPath?: string): ApolloConfig<GatewayConfig> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apolloConfig: Partial<ApolloConfig<GatewayConfig>> = require(getConfigPath(pathResolveFn, cwd, configPath))
  if (!apolloConfig.splitServices) {
    throw new Error('apollo.config.js is missing a "splitServices" key')
  }

  apolloConfig.splitServices.services.map(function verifyApolloServiceConfig (service) {
    if (!service.gitURL || !service.name || !service.directory || !service.apolloConfigPath) {
      throw new Error('apollo.config.js is missing a "gitURL", "name", "directory", "apolloConfigPath" property.')
    }
  })

  return apolloConfig as ApolloConfig<GatewayConfig>
}

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
