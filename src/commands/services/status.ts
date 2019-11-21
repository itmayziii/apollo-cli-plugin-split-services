import { Command, flags } from '@oclif/command'
import {exec, getApolloConfig, randomLogColor} from '../../helpers'
import { ApolloConfig } from '../../interfaces/apollo-config'
import * as path from 'path'

export default class ServiceInit extends Command {
  public static description = 'Pulls down and installs dependencies for all services listed in your apollo.config.js file.'
  public static examples = [
    '$ apollo services:status --config dist/apollo.config.js'
  ]

  public static flags = {
    help: flags.help({ char: 'h' }),
    config: flags.string({ char: 'c', description: 'Path to your Apollo config file' })
  }

  public static args = [{ name: 'file' }]

  public run (): Promise<any> {
    const { flags } = this.parse(ServiceInit)
    let apolloConfig: ApolloConfig
    try {
      apolloConfig = getApolloConfig(flags.config)
    } catch (e) {
      this.error(e.message)
      return Promise.resolve()
    }

    return Promise.all(apolloConfig.services.map<Promise<any>>(service => {
      const serviceDirectory = path.resolve(process.cwd(), 'services', service.directory)
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
