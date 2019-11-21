import { Command, flags } from '@oclif/command'
import * as path from 'path'
import * as Listr from 'listr'
import { Observable } from 'rxjs'
import { pathExists, isJavascriptProject, exec, cloneRepo, getApolloConfig } from '../../helpers'
import {ApolloConfig, Service} from '../../interfaces/apollo-config'

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
      let apolloConfig: ApolloConfig
      try {
        apolloConfig = getApolloConfig(flags.config)
      } catch (e) {
        this.error(e.message)
        return Promise.resolve()
      }

      const tasks = apolloConfig.services.map<Listr.ListrTask>(createTask)
      const listr = new Listr({ concurrent: true })
      listr.add(tasks)
      return listr.run()
    }
}

function createTask (service: Service): Listr.ListrTask<any> {
  return {
    title: service.name,
    task (): Listr.ListrTaskResult<any> {
      return new Observable(observer => {
        const serviceDirectory = path.resolve(process.cwd(), 'services', service.directory)
        pathExists(serviceDirectory)
          .then(function cloneService (doesServiceExist: boolean) {
            if (doesServiceExist) return
            observer.next('Cloning')
            return cloneRepo(service.gitURL, service.directory)
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
