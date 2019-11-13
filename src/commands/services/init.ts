import { Command, flags } from '@oclif/command'
import * as path from 'path'
import * as Listr from 'listr'
import { Observable } from 'rxjs'
import { getConfigPath, pathExists, isJavascriptProject, exec } from '../../helpers'

interface ApolloConfig {
  services?: Service[]
}

interface Service {
  name?: string
  gitURL?: string
  directory?: string
}

export default class ServiceInit extends Command {
    public static description = 'Pulls down and installs dependencies for all services listed in your apollo.config.js file.'
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

      const tasks = apolloConfig.services.reduce<Listr.ListrTask[]>((accumulator, service) => {
        if (!service.gitURL || !service.name || !service.directory) {
          this.error('Every service should have a "gitURL", "name", and "directory"')
          return accumulator
        }

        return [...accumulator, createTask(service.name, service.directory, service.gitURL)]
      }, [])

      const listr = new Listr({ concurrent: true })
      listr.add(tasks)
      return listr.run()
    }
}

function createTask (title: string, directory: string, gitURL: string): Listr.ListrTask<any> {
  return {
    title,
    task (): Listr.ListrTaskResult<any> {
      return new Observable(observer => {
        const serviceDirectory = path.resolve(process.cwd(), 'services', directory)
        pathExists(serviceDirectory)
          .then(function cloneService (doesServiceExist) {
            if (doesServiceExist) return
            observer.next('Cloning')
            return exec(`git clone ${gitURL} ${serviceDirectory}`)
          })
          .then(() => observer.next('Installing/Updating Dependencies'))
          .then(() => isJavascriptProject(serviceDirectory))
          .then(function installJavascriptDependencies (isJavascriptProject) { // Future might provide support for Golang using go.mod etc..
            if (!isJavascriptProject) return
            return exec('npm install', { cwd: serviceDirectory })
          })
          .then(() => observer.complete())
          .catch((error) => observer.error(error))
      })
    }
  }
}
