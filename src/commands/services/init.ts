import { Command, flags } from '@oclif/command'
import * as path from 'path'
import * as util from 'util'
import * as childProcess from 'child_process'
import * as Listr from 'listr'
import { Observable } from 'rxjs'
import { getConfigPath } from '../../helpers'

interface ApolloConfig {
  services?: Service[]
}

interface Service {
  name?: string
  gitURL?: string
  directory?: string
}

const exec = util.promisify(childProcess.exec)

export default class ServiceInit extends Command {
    public static description = 'describe the command here'
    public static examples = [
      '$ apollo services:init --config dist/apollo.config.js'
    ]

    public static flags = {
      help: flags.help({ char: 'h' }),
      config: flags.string({ char: 'c', description: 'Path to your Apollo config file' })
    }

    public static args = [{ name: 'file' }]

    public run (): Promise<any> {
      const { flags } = this.parse(ServiceInit)
      const apolloConfig: ApolloConfig = require(getConfigPath(flags.config)) // eslint-disable-line @typescript-eslint/no-var-requires
      if (!apolloConfig.services) {
        this.error('apollo.config.js is missing a "services" key')
        return Promise.resolve()
      }

      const clonedRepos = new Listr({ concurrent: true })
      apolloConfig.services.forEach((service) => {
        if (!service.gitURL || !service.name || !service.directory) {
          this.error('Every service should have a "gitURL", "name", and "directory"')
          return
        }

        clonedRepos.add(createTask(service.name, service.directory, service.gitURL))
      })

      return clonedRepos.run()
    }
}

function createTask (title: string, directory: string, gitURL: string): Listr.ListrTask<void> {
  return {
    title,
    task (): Listr.ListrTaskResult<void> {
      return new Observable(observer => {
        const absoluteDirectory = path.resolve(process.cwd(), 'services', directory)
        observer.next('Cloning')
        exec(`git clone ${gitURL} ${absoluteDirectory}`)
          .then(() => {
            observer.next('Installing Dependencies')
            return exec('npm install', { cwd: absoluteDirectory })
          })
          .then(() => observer.complete())
          .catch((error) => observer.error(error))
      })
    }
  }
}
