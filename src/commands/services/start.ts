import { Command, flags } from '@oclif/command'
import { withCommonGatewaySetup } from '../../helpers'
import { servicesStart } from '../../command-fns/services/start'

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
    const parsedCommand = this.parse(ServicesStart)
    try {
      return withCommonGatewaySetup(this, parsedCommand, servicesStart)()
        .catch(error => this.error(error, { exit: 1 }))
    } catch (e) {
      this.error(e, { exit: 1 })
    }
  }
}
