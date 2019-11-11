import * as path from 'path'

export function getConfigPath (configPath?: string): string {
  if (!configPath) {
    return path.resolve(process.cwd(), 'apollo.config.js')
  }

  if (configPath.startsWith('/')) {
    return configPath
  }

  return path.resolve(process.cwd(), configPath)
}
