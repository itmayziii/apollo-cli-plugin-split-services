import { Command, flags } from '@oclif/command'
import { withCommonGatewaySetup } from '../../helpers'
import { servicesInit } from '../../command-fns/services/init'

export default class ServicesInit extends Command {
    public static description = 'Clones and installs dependencies for all services listed in your apollo.config.js file.'
    public static examples = [
      '$ apollo services:init --config dist/apollo.config.js'
    ]

    public static flags = {
      help: flags.help({ char: 'h' }),
      config: flags.string({ char: 'c', description: 'Path to your Apollo config file.', default: 'apollo.config.js' })
    }

    public static args = []

    public run (): Promise<any> {
      const parsedCommand = this.parse(ServicesInit)
      try {
        return withCommonGatewaySetup(this, parsedCommand, servicesInit)()
          .catch(error => this.error(error, { exit: 1 }))
      } catch (error) {
        this.error(error, { exit: 1 })
      }
    }
}
