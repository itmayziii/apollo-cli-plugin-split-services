import {Command, flags} from '@oclif/command'
import * as path from 'path'
import * as util from 'util'
import * as childProcess from 'child_process'
import cli from 'cli-ux'
import * as Listr from 'listr'
import { Observable } from "rxjs"

interface Service {
    name?: string
    gitURL?: string
    directory?: string
}

const exec = util.promisify(childProcess.exec)

export default class Init extends Command {
    public static description = 'describe the command here'
    public static examples = [
        `$ apollo hello
hello world from ./src/hello.ts!
`,
    ]
    public static flags = {
        help: flags.help({char: 'h'}),
        // flag with a value (-n, --name=VALUE)
        name: flags.string({char: 'n', description: 'name to print'}),
        // flag with no value (-f, --force)
        force: flags.boolean({char: 'f'}),
    }
    public static args = [{name: 'file'}]

    public run(): Promise<any> {
        const cwd = process.cwd()
        const config = require(path.resolve(cwd, 'apollo.config.js'))
        if (!config.services) {
            this.error('Add a "services" key to apollo.config.js')
            return Promise.resolve()
        }

        const clonedRepos = new Listr({ concurrent: true });
        (config.services as Service[]).forEach((service) => {
            if (!service.gitURL || !service.name || !service.directory) {
                this.error('Every service should have a "gitURL", "name", and "directory"')
                return
            }

            clonedRepos.add({
                title: service.name,
                task: () => {
                    return new Observable(observer => {
                        // @ts-ignore
                        const directory = path.resolve(cwd, 'services', service.directory)
                        observer.next('Cloning')
                        exec(`git clone ${service.gitURL} ${directory}`)
                            .then(() => {
                                observer.next('Installing Dependencies')
                                return exec(`npm install`, { cwd: directory })
                            })
                            .then(() => observer.complete())
                            .catch((error) => observer.error(error))
                    })
                }
            })
        })

        return clonedRepos.run()
    }
}
