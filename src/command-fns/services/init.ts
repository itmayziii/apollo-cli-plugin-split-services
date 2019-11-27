import * as Parser from '@oclif/parser'
import { ApolloConfig, GatewayConfig, SplitService } from '../../interfaces/apollo-config'
import * as Listr from 'listr'
import { Observable } from 'rxjs'
import * as path from 'path'
import { AccessFileFn, cloneRepo, CommandReporter, ExecFn, isJavascriptProject, pathExists, PathResolveFn } from '../../helpers'
import ServicesInit from '../../commands/services/init'
import {Input} from '@oclif/command/lib/flags'

/**
 * For each service in the apollo.config.js file this function will make sure all the services have a local repository,
 * as well as up to date dependencies.
 *
 * @param apolloConfig - {@link GatewayConfig}
 * @param commandReporter - {@link CommandReporter}
 * @param parsedOutput - Configuration passed in to the CLI like flags and args.
 * @param pathResolver - {@link PathResolveFn}
 * @param access - {@link AccessFileFn}
 * @param exec - {@link ExecFn}
 * @param cwd - The current working directory.
 */
export function servicesInitFn (
  apolloConfig: ApolloConfig<GatewayConfig>,
  commandReporter: CommandReporter,
  parsedOutput: Parser.Output<{
    help: void
    config: string
  }, any>,
  pathResolver: PathResolveFn,
  access: AccessFileFn,
  exec: ExecFn,
  cwd: string
): Promise<any> {
  parsedOutput.flags.config.startsWith('')
  const tasks = apolloConfig.splitServices.services.map<Listr.ListrTask>((service) => createTask(service, cwd, pathResolver, exec, access))
  const listr = new Listr({ concurrent: true })
  listr.add(tasks)
  return listr.run()
}

/**
 * Task to make sure all repos exist locally and dependencies are up to date.
 *
 * @param service - {@link SplitService}
 * @param cwd - The current working directory.
 * @param pathResolver - {@link PathResolveFn}
 * @param exec - {@link ExecFn}
 * @param access - {@link AccessFileFn}
 */
function createTask (service: SplitService, cwd: string, pathResolver: PathResolveFn, exec: ExecFn, access: AccessFileFn): Listr.ListrTask<any> {
  return {
    title: service.name,
    task (): Listr.ListrTaskResult<any> {
      return new Observable(observer => {
        const serviceDirectory = pathResolver(process.cwd(), 'services', service.directory)
        pathExists(access, serviceDirectory)
          .then(function cloneService (doesServiceExist: boolean) {
            if (doesServiceExist) return
            observer.next('Cloning')
            return cloneRepo(exec, service.gitURL, service.directory)
          })
          .then(() => observer.next('Installing/Updating Dependencies'))
          .then(() => isJavascriptProject(access, path.resolve, serviceDirectory))
          .then(function installJavascriptDependencies (isJavascriptProject) { // Future might provide support for Golang using go.mod etc..
            if (!isJavascriptProject) return
            return exec('npm install', { cwd: serviceDirectory })
          })
          .then(() => observer.complete())
          .catch((error) => observer.error(error))
      })
    }
  }
}
