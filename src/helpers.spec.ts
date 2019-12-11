import {
  cloneRepo,
  getConfigPath,
  getGatewayApolloConfig,
  getServiceApolloConfig,
  isJavascriptProject,
  pathExists
} from './helpers'
import * as path from 'path'
import * as fs from 'fs'

describe('getConfigPath', () => {
  it('should return the apollo.config.js file from the current working directory if a config path is not provided',
    () => {
      const pathSpy = jasmine.createSpyObj(['resolve'])
      pathSpy.resolve.withArgs('/apples', 'apollo.config.js').and.returnValue('/apples/apollo.config.js')
      const actual = getConfigPath(pathSpy, '/apples', 'apollo.config.js')
      const expected = '/apples/apollo.config.js'
      expect(actual).toBe(expected)
    })

  it('should simply return the passed in config path if it is an absolute path', () => {
    const pathSpy = jasmine.createSpyObj(['resolve'])
    const actual = getConfigPath(pathSpy, '/apples', '/Users/Tmay/bananas/apollo.config.js')
    const expected = '/Users/Tmay/bananas/apollo.config.js'
    expect(actual).toBe(expected)
  })

  it('should return the config path relative to the current directory if the config path is relative', () => {
    const pathSpy = jasmine.createSpyObj(['resolve'])
    pathSpy.resolve.withArgs('/apples', 'bananas/apollo.config.js').and.returnValue('/apples/bananas/apollo.config.js')
    const actual = getConfigPath(pathSpy, '/apples', 'bananas/apollo.config.js')
    const expected = '/apples/bananas/apollo.config.js'
    expect(actual).toBe(expected)
  })
})

describe('pathExists', () => {
  it('should return true if the file exists and is accessible', () => {
    const accessFileFnSpy = jasmine.createSpy('access').withArgs('/apples', fs.constants.F_OK).and.returnValue(Promise.resolve())
    return pathExists(accessFileFnSpy, '/apples')
      .then((actual) => {
        expect(actual).toBeTrue()
      })
  })

  it('should return false if the file does not exist or is not accessible', () => {
    const accessFileFnSpy = jasmine.createSpy('access').withArgs('/giraffes', fs.constants.F_OK).and.returnValue(Promise.reject(new Error('no file')))
    return pathExists(accessFileFnSpy, '/giraffes')
      .then(actual => {
        expect(actual).toBeFalse()
      })
  })
})

describe('isJavascriptProject', () => {
  it('should return true if the project has a package.json file in its root', () => {
    const accessFileFnSpy = jasmine.createSpy('access').withArgs('/apples/package.json', fs.constants.F_OK).and.returnValue(Promise.resolve())
    const pathSpy = jasmine.createSpyObj(['resolve'])
    pathSpy.resolve.withArgs('/apples', 'package.json').and.returnValue('/apples/package.json')
    return isJavascriptProject(accessFileFnSpy, pathSpy, '/apples')
      .then(actual => {
        expect(actual).toBeTrue()
      })
  })

  it('should return false if the project does not have a package.json in its root', () => {
    const accessFileFnSpy = jasmine.createSpy('access').withArgs('/apples/package.json', fs.constants.F_OK).and.returnValue(Promise.reject(new Error('no file')))
    const pathSpy = jasmine.createSpyObj(['resolve'])
    pathSpy.resolve.withArgs('/apples', 'package.json').and.returnValue('/apples/package.json')
    return isJavascriptProject(accessFileFnSpy, pathSpy, '/apples')
      .then(actual => {
        expect(actual).toBeFalse()
      })
  })
})

describe('cloneRepo', () => {
  it('should run a git clone command with the git URL if no directory is provided', () => {
    const execFnSpy = jasmine.createSpy('exec').withArgs('git clone https://github.com/BudgetDumpster/giraffes')
      .and.returnValue(Promise.resolve({
        stdout: 'Successfully cloned repo',
        stderr: ''
      }))
    return cloneRepo(execFnSpy, 'https://github.com/BudgetDumpster/giraffes')
      .then(actual => {
        const expectedStdout = 'Successfully cloned repo'
        const expectedStderr = ''
        expect(actual.stdout).toBe(expectedStdout)
        expect(actual.stderr).toBe(expectedStderr)
      })
  })

  it('should run a git clone command with the git URL and directory', () => {
    const execFnSpy = jasmine.createSpy('exec').withArgs('git clone https://github.com/BudgetDumpster/giraffes bd-giraffes')
      .and.returnValue(Promise.resolve({
        stdout: 'Successfully cloned repo',
        stderr: ''
      }))
    return cloneRepo(execFnSpy, 'https://github.com/BudgetDumpster/giraffes', 'bd-giraffes')
      .then(actual => {
        const expectedStdout = 'Successfully cloned repo'
        const expectedStderr = ''
        expect(actual.stdout).toBe(expectedStdout)
        expect(actual.stderr).toBe(expectedStderr)
      })
  })
})

describe('randomLogColor', () => {
  // TODO add these tests, unfortunately I couldn't figure out how to compare these chalk functions. chalk.blue === chalk.blue was
  //  always false
  xit('should return a random color for logging', () => {})
})

describe('getGatewayApolloConfig', () => {
  it('should throw an error if the config file does not exist', () => {
    expect(() => getGatewayApolloConfig('apollo.config.js', path, '/Users/notARealUser/fakePath')).toThrow()
  })

  it('should throw an error if the config file is missing a "splitServices" key', () => {
    expect(() => getGatewayApolloConfig('dist/test-configs/missing-split-services-apollo.config', path, process.cwd()))
      .toThrowError('apollo.config.js is missing a "splitServices" key')
  })

  it('should throw an error if the config file is missing a "splitServices.services" key', () => {
    expect(() => getGatewayApolloConfig('dist/test-configs/empty-split-services-apollo.config', path, process.cwd()))
      .toThrowError('apollo.config.js is missing a "splitServices.services" key')
  })

  it('should throw an error if the services are missing any of their required properties', () => {
    expect(() => getGatewayApolloConfig('dist/test-configs/gateway-missing-split-services-services-props-apollo.config', path, process.cwd()))
      .toThrowError('apollo.config.js is missing a "gitURL", "name", or "directory" property.')
  })

  it('should return an apollo config if the file exists and is valid', () => {
    const actual = getGatewayApolloConfig('dist/test-configs/gateway-valid-apollo.config', path, process.cwd())
    expect(actual.splitServices.services[0].name).toBe('Orders')
    expect(actual.splitServices.services[0].gitURL).toBe('https://github.com/BudgetDumpster/orders')
    expect(actual.splitServices.services[0].directory).toBe('services/orders')
  })
})

describe('getServiceApolloConfig', () => {
  it('should throw an error if the config file does not exist', () => {
    expect(() => getServiceApolloConfig(path, '/Users/notARealUser/fakePath', 'apollo.config.js')).toThrow()
  })

  it('should throw an error if the config file is missing a "splitServices" key', () => {
    expect(() => getServiceApolloConfig(path, process.cwd(), 'dist/test-configs/missing-split-services-apollo.config'))
      .toThrowError('apollo.config.js is missing a "splitServices" key')
  })

  it('should throw an error if the config file is missing a "splitServices.url" key', () => {
    expect(() => getServiceApolloConfig(path, process.cwd(), 'dist/test-configs/empty-split-services-apollo.config'))
      .toThrowError('apollo.config.js is missing a "splitServices.url" key')
  })

  it('should return an apollo config if the file exists and is valid', () => {
    const actual = getServiceApolloConfig(path, process.cwd(), 'dist/test-configs/service-valid-apollo.config')
    expect(actual.splitServices.url).toBe('http://127.0.0.1:4200/graphql')
  })
})
