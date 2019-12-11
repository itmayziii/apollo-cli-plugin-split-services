import * as nodePath from 'path'
import * as Parser from '@oclif/parser'
import { ApolloConfig, GatewayConfig, SplitService } from '../../interfaces/apollo-config'
import * as Listr from 'listr'
import { Observable } from 'rxjs'
import { Access, CloneRepo, Exec, IsJavascriptProject, PathExists } from '../../interfaces/helpers'
import { CommandReporter } from '../../interfaces/command-reporter'
import {
  access,
  cloneRepo as cloneRepoFn,
  exec as execCommand,
  isJavascriptProject as isJavascriptProjectFn,
  pathExists as doesPathExist
} from '../../helpers'

/**
 * For each service in the apollo.config.js file this function will make sure all the services have a local repository,
 * as well as up to date dependencies.
 *
 * @param apolloConfig - {@link GatewayConfig}
 * @param reporter - {@link CommandReporter}
 * @param parsedOutput - Configuration passed in to the CLI like flags and args.
 * @param path - NodeJS path module.
 * @param accessFile - {@link Access}
 * @param exec - {@link Exec}
 * @param pathExists - {@link PathExists}
 * @param isJavascriptProject - {@link IsJavascriptProject}
 * @param cloneRepo - {@link CloneRepo}
 * @param cwd - The current working directory.
 * @param listrRenderer - {@link Listr.ListrRendererValue}
 */
export function servicesInit (
  apolloConfig: ApolloConfig<GatewayConfig>,
  reporter: CommandReporter,
  parsedOutput: Parser.Output<{
    help: void
    config: string
  }, any>,
  listrRenderer: Listr.ListrRendererValue<Listr.ListrOptions> = 'default',
  path: typeof nodePath = nodePath,
  accessFile: Access = access,
  exec: Exec = execCommand,
  pathExists: PathExists = doesPathExist,
  isJavascriptProject: IsJavascriptProject = isJavascriptProjectFn,
  cloneRepo: CloneRepo = cloneRepoFn,
  cwd: string = process.cwd()
): Promise<any> {
  const tasks = apolloConfig.splitServices.services.map<Listr.ListrTask>(
    service => createTask(service, cwd, pathExists, isJavascriptProject, cloneRepo, path, exec, accessFile)
  )
  const listr = new Listr({ concurrent: true, renderer: listrRenderer })
  listr.add(tasks)
  return listr.run()
}

/**
 * Task to make sure all repos exist locally and dependencies are up to date.
 *
 * @param service - {@link SplitService}
 * @param cwd - The current working directory.
 * @param pathExists - {@link PathExists}
 * @param isJavascriptProject - {@link IsJavascriptProject}
 * @param cloneRepo - {@link CloneRepo}
 * @param path - NodeJS path module.
 * @param exec - {@link Exec}
 * @param access - {@link Access}
 */
function createTask (
  service: SplitService,
  cwd: string,
  pathExists: PathExists,
  isJavascriptProject: IsJavascriptProject,
  cloneRepo: CloneRepo,
  path: typeof nodePath,
  exec: Exec,
  access: Access
): Listr.ListrTask<any> {
  return {
    title: service.name,
    task (): Listr.ListrTaskResult<any> {
      return new Observable(observer => {
        const serviceDirectory = path.resolve(cwd, service.directory)
        pathExists(access, serviceDirectory)
          .then(function cloneService (doesServiceExist: boolean) {
            if (doesServiceExist) return
            observer.next('Cloning')
            return cloneRepo(exec, service.gitURL, `${service.directory}`)
          })
          .then(() => observer.next('Installing/Updating Dependencies'))
          .then(() => isJavascriptProject(access, path, serviceDirectory))
          .then(function installJavascriptDependencies (isJavascriptProject) { // Future might provide support for Golang using go.mod etc..
            if (!isJavascriptProject) {
              observer.error(new Error(`${service.name} is currently not a supported project type. We currently support javascript projects only but this package will happily take pull requests to support other languages.`))
              return
            }
            return exec('npm install', { cwd: serviceDirectory })
          })
          .then(() => observer.complete())
          .catch((error) => observer.error(error))
      })
    }
  }
}
