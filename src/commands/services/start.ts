import { Command, flags } from '@oclif/command'
import { access, getGatewayApolloConfig, isJavascriptProject } from '../../helpers'
import { ApolloConfig, GatewayConfig } from '../../interfaces/apollo-config'
import * as path from 'path'
import * as concurrently from 'concurrently'

export default class ServicesStart extends Command {
  public static description = 'Start services listed in your apollo.config.js file.'
  public static examples = [
    '$ apollo services:start --config dist/apollo.config.js'
  ]

  public static flags = {
    help: flags.help({ char: 'h' }),
    config: flags.string({ char: 'c', description: 'Path to your Apollo config file.', default: 'apollo.config.js' })
    // TODO add flag to only start specific services
  }

  public static args = []

  public run (): Promise<any> {
    const { flags } = this.parse(ServicesStart)
    let apolloConfig: ApolloConfig<GatewayConfig>
    try {
      apolloConfig = getGatewayApolloConfig(path.resolve, process.cwd(), flags.config)
    } catch (e) {
      this.error(e.message)
      return Promise.resolve()
    }

    return Promise.all(apolloConfig.splitServices.services.reduce<Promise<concurrently.CommandObj>[]>((accumulator, service) => {
      const serviceDirectory = path.resolve(process.cwd(), 'services', service.directory)
      const blah = isJavascriptProject(access, path.resolve, serviceDirectory)
        .then(isJavascriptProject => {
          if (!isJavascriptProject) {
            this.error(`Unsupported Project type for service: ${service.name}`)
          }

          return { name: service.name, command: `cd ${serviceDirectory} && npm run start` }
        })

      return [...accumulator, blah]
    }, []))
      .then((commands) => concurrently(commands))
  }
}
