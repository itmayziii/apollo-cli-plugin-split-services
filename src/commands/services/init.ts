import { Command, flags } from '@oclif/command'
import * as path from 'path'
import { access, cloneRepo, exec, isJavascriptProject, pathExists, withCommonGatewaySetup } from '../../helpers'
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
        const cwd = process.cwd()
        return withCommonGatewaySetup(this, parsedCommand, servicesInit, path.resolve, cwd)(
          path.resolve,
          access,
          exec,
          pathExists,
          isJavascriptProject,
          cloneRepo,
          cwd
        )
          .catch(error => this.error(error, { exit: 1 }))
      } catch (error) {
        this.error(error, { exit: 1 })
      }
    }
}
