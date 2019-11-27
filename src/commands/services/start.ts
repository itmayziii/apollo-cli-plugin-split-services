import { Command, flags } from '@oclif/command'
import { access, isJavascriptProject, withCommonGatewaySetup } from '../../helpers'
import * as path from 'path'
import { servicesStart } from '../../command-fns/services/start'
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
    const parsedCommand = this.parse(ServicesStart)
    try {
      const cwd = process.cwd()
      return withCommonGatewaySetup(this, parsedCommand, servicesStart, path.resolve, cwd)(
        path.resolve,
        access,
        isJavascriptProject,
        concurrently,
        cwd
      )
    } catch (e) {
      this.error(e.message, { exit: 1 })
    }
  }
}
