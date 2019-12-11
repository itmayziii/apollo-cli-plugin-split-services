import { ApolloConfig, GatewayConfig } from '../../interfaces/apollo-config'
import * as Parser from '@oclif/parser'
import { PathResolve, RandomLogColor, Exec } from '../../interfaces/helpers'
import { CommandReporter } from '../../interfaces/command-reporter'

/**
 * Start services listed in your apollo.config.js file.
 *
 * @param apolloConfig - {@link GatewayConfig}
 * @param reporter - {@link CommandReporter}
 * @param parsedOutput - Configuration passed in to the CLI like flags and args.
 * @param pathResolver - {@link PathResolve}
 * @param randomLogColor - {@link RandomLogColor}
 * @param exec - {@link Exec}
 * @param cwd - The current working directory.
 */
export function servicesStatus (
  apolloConfig: ApolloConfig<GatewayConfig>,
  reporter: CommandReporter,
  parsedOutput: Parser.Output<{
    help: void
    config: string
  }, any>,
  pathResolver: PathResolve,
  randomLogColor: RandomLogColor,
  exec: Exec,
  cwd: string
): Promise<any> {
  return Promise.all(apolloConfig.splitServices.services.map<Promise<{ service: string, stdout: string, stderr: string }>>(service => {
    const serviceDirectory = pathResolver(cwd, service.directory)
    return exec('git status', { cwd: serviceDirectory })
      .then((childProcess) => ({ ...childProcess, service: service.name }))
  }))
    .then(gitStatusResults => {
      return gitStatusResults.map(({ service, stdout }) => {
        const randomColor = randomLogColor()
        reporter.log(randomColor(`########################### ${service} ###########################`))
        reporter.log(stdout)
        reporter.log(randomColor(`########################### End ${service} ###########################\n`))
      })
    })
}
