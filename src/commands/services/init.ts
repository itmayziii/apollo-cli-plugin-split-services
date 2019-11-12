import { Command, flags } from '@oclif/command'
import * as path from 'path'
import * as util from 'util'
import * as childProcess from 'child_process'
import * as fs from 'fs'
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
const access = util.promisify(fs.access)

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
        const serviceDirectory = path.resolve(process.cwd(), 'services', directory)
        pathExists(serviceDirectory)
          .then(function cloneService (doesServiceExist) {
            console.log('doesServiceExist', doesServiceExist)
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

function pathExists (directory: string): Promise<boolean> {
  return access(directory, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

function isJavascriptProject (directory: string): Promise<boolean> {
  return pathExists(path.resolve(directory, 'package.json'))
}
