import * as nodePath from 'path'
import { access, exec } from '../helpers'
import { Chalk } from 'chalk'

export type Access = typeof access
export type Exec = typeof exec

/**
 * Checks if a path exists and is accessible.
 */
export interface PathExists {
  /**
   * @param accessFile - {@link Access}
   * @param aPath - Path to the file or directory.
   * @returns Whether or not a path exists and is accessible.
   */
  (accessFile: Access, aPath: string): Promise<boolean>
}

/**
 * Checks if a directory is a javascript project.
 */
export interface IsJavascriptProject {
  /**
   * @param accessFile - {@link Access}
   * @param path - NodeJS path module.
   * @param directory - path to directory to check if it is a javascript project.
   * @returns Whether or not the `directory` is a javascript project.
   */
  (accessFile: Access, path: typeof nodePath, directory: string): Promise<boolean>
}

/**
 * Clones a repository from a URL.
 */
export interface CloneRepo {
  /**
   * @param exec - {@link Exec}
   * @param gitURL - URL of the git repo.
   * @param directory - Optionally name the directory the repo should be cloned to.
   * @returns The output of stdout and stderr from the child process.
   */
  (exec: Exec, gitURL: string, directory?: string): Promise<{ stdout: string, stderr: string }>
}

/**
 * Returns a random color for logging.
 */
export interface RandomLogColor {
  /**
   * @returns A random color for logging.
   */
  (): Chalk
}
