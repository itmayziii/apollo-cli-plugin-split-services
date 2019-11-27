import * as childProcess from 'child_process'

/**
 * Resolves an absolute path out of multiple path segments.
 */
export interface PathResolve {
  /**
   * @param pathSegments - Segments of a whole page like ['/apples/', 'oranges', 'bananas/pineapple'].
   * @return An absolute path consisting of the path segments.
   */
  (...pathSegments: string[]): string
}

/**
 * Asynchronously tests a user's permissions for the file specified by path.
 */
export interface AccessFile {
  /**
   * @param path - Path to check permissions on.
   * @param mode - Examples are `fs.constants.F_OK` and `fs.constants.W_OK`.
   * @return A promise that will throw into the catch if it does not pass.
   */
  (path: string, mode: number): Promise<void>
}

/**
 * Run a command with space separated arguments.
 */
export interface Exec {
  /**
   * @param command - Command to execute like "npm install".
   * @param options - {@link childProcess.ExecOptions}
   * @returns The standard out and error of the `command`.
   */
  (command: string, options?: childProcess.ExecOptions): Promise<{ stdout: string, stderr: string }>
}

/**
 * Checks if a path exists and is accessible.
 */
export interface PathExists {
  /**
   * @param accessFile - {@link AccessFile}
   * @param aPath - Path to the file or directory.
   * @returns Whether or not a path exists and is accessible.
   */
  (accessFile: AccessFile, aPath: string): Promise<boolean>
}

/**
 * Checks if a directory is a javascript project.
 */
export interface IsJavascriptProject {
  /**
   * @param accessFile - {@link AccessFile}
   * @param pathResolveFn - {@link PathResolve}
   * @param directory - path to directory to check if it is a javascript project.
   * @returns Whether or not the `directory` is a javascript project.
   */
  (accessFile: AccessFile, pathResolveFn: PathResolve, directory: string): Promise<boolean>
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
