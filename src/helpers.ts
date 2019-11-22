import * as path from 'path'
import * as fs from 'fs'
import * as util from 'util'
import * as childProcess from 'child_process'
import chalk, { Chalk } from 'chalk'
import { ApolloConfig, GatewayConfig } from './interfaces/apollo-config'

export const exec = util.promisify(childProcess.exec)
export const access = util.promisify(fs.access)

export function getConfigPath (configPath?: string): string {
  if (!configPath) {
    return path.resolve(process.cwd(), 'apollo.config.js')
  }

  if (configPath.startsWith('/')) {
    return configPath
  }

  return path.resolve(process.cwd(), configPath)
}

export function pathExists (directory: string): Promise<boolean> {
  return access(directory, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

export function isJavascriptProject (directory: string): Promise<boolean> {
  return pathExists(path.resolve(directory, 'package.json'))
}

export function cloneRepo (gitURL: string, directory?: string): Promise<{ stdout: string, stderr: string }> {
  const command = directory ? `git clone ${gitURL}` : `git clone ${gitURL} ${directory}`
  return exec(command)
}

export function getApolloConfig (configPath?: string): ApolloConfig<GatewayConfig> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apolloConfig: Partial<ApolloConfig<GatewayConfig>> = require(getConfigPath(configPath))
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
