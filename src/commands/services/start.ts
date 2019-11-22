import { Command, flags } from '@oclif/command'
import { getApolloConfig, isJavascriptProject } from '../../helpers'
import { ApolloConfig, ServiceGatewayConfig } from '../../interfaces/apollo-config'
import * as path from 'path'
import * as concurrently from 'concurrently'

export default class ServiceStart extends Command {
  public static description = 'Start services listed in your apollo.config.js file.'
  public static examples = [
    '$ apollo services:start --config dist/apollo.config.js'
  ]

  public static flags = {
    help: flags.help({ char: 'h' }),
    config: flags.string({ char: 'c', description: 'Path to your Apollo config file' })
    // TODO add flag to only start specific services
  }

  public static args = [{ name: 'file' }]

  public run (): Promise<any> {
    const { flags } = this.parse(ServiceStart)
    let apolloConfig: ApolloConfig<ServiceGatewayConfig>
    try {
      apolloConfig = getApolloConfig(flags.config)
    } catch (e) {
      this.error(e.message)
      return Promise.resolve()
    }

    return Promise.all(apolloConfig.services.reduce<Promise<concurrently.CommandObj>[]>((accumulator, service) => {
      const serviceDirectory = path.resolve(process.cwd(), 'services', service.directory)
      const blah = isJavascriptProject(serviceDirectory)
        .then(isJavascriptProject => {
          return { name: service.name, command: `cd ${serviceDirectory} && npm run start` }
        })

      return [...accumulator, blah]
    }, []))
      .then((commands) => concurrently(commands))
  }
}
