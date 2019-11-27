import { Command, flags } from '@oclif/command'
import { exec, randomLogColor, withCommonGatewaySetup } from '../../helpers'
import * as path from 'path'
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
      const cwd = process.cwd()
      return withCommonGatewaySetup(this, parsedCommand, servicesStatus, path.resolve, cwd)(
        path.resolve,
        randomLogColor,
        exec,
        cwd
      )
        .catch((error: Error) => this.error(error, { exit: 1 }))
    } catch (error) {
      this.error(error, { exit: 1 })
    }
  }
}
