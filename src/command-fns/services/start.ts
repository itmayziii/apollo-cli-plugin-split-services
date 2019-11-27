import { ApolloConfig, GatewayConfig } from '../..'
import * as Parser from '@oclif/parser'
import { AccessFile, IsJavascriptProject, PathResolve } from '../../interfaces/helpers'
import { CommandReporter } from '../../interfaces/command-reporter'
import { Concurrent } from '../../interfaces/concurrent'
import * as concurrently from 'concurrently'

/**
 * Start services listed in your apollo.config.js file.
 *
 * @param apolloConfig - {@link GatewayConfig}
 * @param reporter - {@link CommandReporter}
 * @param parsedOutput - Configuration passed in to the CLI like flags and args.
 * @param pathResolver - {@link PathResolve}
 * @param access - {@link AccessFile}
 * @param isJavascriptProject - {@link IsJavascriptProject}
 * @param concurrent - {@link Concurrent}
 * @param cwd - The current working directory.
 */
export function servicesStart (
  apolloConfig: ApolloConfig<GatewayConfig>,
  reporter: CommandReporter,
  parsedOutput: Parser.Output<{
    help: void
    config: string
  }, any>,
  pathResolver: PathResolve,
  access: AccessFile,
  isJavascriptProject: IsJavascriptProject,
  concurrent: Concurrent,
  cwd: string
): Promise<any> {
  return Promise.all(apolloConfig.splitServices.services.map<Promise<concurrently.CommandObj | undefined>>(service => {
    const serviceDirectory = pathResolver(cwd, service.directory)
    return isJavascriptProject(access, pathResolver, serviceDirectory)
      .then(isJavascriptProject => {
        if (!isJavascriptProject) {
          reporter.warn(`Unsupported project type for ${service.name} service, service will not be started.`)
          return
        }

        return { name: service.name, command: `cd ${serviceDirectory} && npm run start` }
      })
  }))
    .then(commands => commands.reduce<concurrently.CommandObj[]>((accumulator, commandObj) => {
      if (!commandObj) return accumulator
      return [...accumulator, commandObj]
    }, []))
    .then(validCommands => {
      if (!validCommands.length) {
        reporter.error('Failed to start any of the services.', { exit: 1 })
        return
      }

      return concurrent(validCommands)
    })
}
