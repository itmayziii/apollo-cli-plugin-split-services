import * as path from 'path'
import * as fs from 'fs'
import * as util from 'util'
import * as childProcess from 'child_process'
import {PromiseWithChild} from 'child_process'

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
