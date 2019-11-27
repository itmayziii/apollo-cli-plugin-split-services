import { Command, flags } from '@oclif/command'
import * as path from 'path'
import { access, exec, withCommonGatewaySetup } from '../../helpers'
import { servicesInitFn } from '../../command-fns/services/init'

export default class ServicesInit extends Command {
    public static description = 'Pulls down and installs dependencies for all services listed in your apollo.config.js file.'
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
        const cwd = process.cwd()
        return withCommonGatewaySetup(this, parsedCommand, servicesInitFn, path.resolve, cwd)(path.resolve, access, exec, cwd)
      } catch (e) {
        this.error(e.message, { exit: 1 })
      }
    }
}
