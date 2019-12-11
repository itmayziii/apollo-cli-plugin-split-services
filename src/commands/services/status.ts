import { Command, flags } from '@oclif/command'
import { withCommonGatewaySetup } from '../../helpers'
import { servicesStatus } from '../../command-fns/services/status'

export default class ServicesStatus extends Command {
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
    const parsedCommand = this.parse(ServicesStatus)
    try {
      return withCommonGatewaySetup(this, parsedCommand, servicesStatus)()
        .catch((error: Error) => this.error(error, { exit: 1 }))
    } catch (error) {
      this.error(error, { exit: 1 })
    }
  }
}
