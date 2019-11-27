import { Command, flags } from '@oclif/command'
import { exec, getGatewayApolloConfig, randomLogColor } from '../../helpers'
import { ApolloConfig, GatewayConfig } from '../../interfaces/apollo-config'
import * as path from 'path'

export default class ServicesInit extends Command {
  public static description = 'Checks the git status for all services listed in your apollo.config.js file.'
  public static examples = [
    '$ apollo services:status --config dist/apollo.config.js'
  ]

  public static flags = {
    help: flags.help({ char: 'h' }),
    config: flags.string({ char: 'c', description: 'Path to your Apollo config file.', default: 'apollo.config.js' })
  }

  public static args = []

  public run (): Promise<any> {
    const { flags } = this.parse(ServicesInit)
    let apolloConfig: ApolloConfig<GatewayConfig>
    try {
      apolloConfig = getGatewayApolloConfig(path.resolve, process.cwd(), flags.config)
    } catch (e) {
      this.error(e.message)
      return Promise.resolve()
    }

    return Promise.all(apolloConfig.splitServices.services.map<Promise<any>>(service => {
      const serviceDirectory = path.resolve(process.cwd(), service.directory)
      const randomColor = randomLogColor()
      return exec('git status', { cwd: serviceDirectory })
        .then((val) => {
          this.log(randomColor(`########################### ${service.name} ###########################`))
          this.log(val.stdout)
          this.log(randomColor(`########################### End ${service.name} ###########################\n`))
        })
        .catch((error) => console.error(error))
    }))
  }
}
