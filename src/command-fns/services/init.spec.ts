import { servicesInit } from './init'
import { ApolloConfig, GatewayConfig } from '../../interfaces/apollo-config'

describe('servicesInit', () => {
  let apolloConfig: ApolloConfig<GatewayConfig>
  let reporterSpy: any
  let parsedOutput: any
  let pathResolverSpy: jasmine.Spy
  let accessSpy: jasmine.Spy
  let execSpy: jasmine.Spy
  let pathExistsSpy: jasmine.Spy
  let isJavascriptProjectSpy: jasmine.Spy
  let cloneRepoSpy: jasmine.Spy
  beforeEach(() => {
    apolloConfig = {
      splitServices: {
        services: [
          {
            name: 'Orders',
            gitURL: 'https://github.com/BudgetDumpster/orders',
            directory: 'services/orders'
          },
          {
            name: 'Products',
            gitURL: 'https://github.com/BudgetDumpster/products',
            directory: 'services/products'
          },
          {
            name: 'Accounts',
            gitURL: 'https://github.com/BudgetDumpster/accounts',
            directory: 'services/accounts'
          }
        ]
      }
    }
    reporterSpy = jasmine.createSpyObj([''])
    parsedOutput = jasmine.createSpyObj([''])
    pathResolverSpy = jasmine.createSpy('pathResolver')
      .withArgs('/apples', 'services/orders').and.returnValue('/apples/services/orders')
      .withArgs('/apples', 'services/products').and.returnValue('/apples/services/products')
      .withArgs('/apples', 'services/accounts').and.returnValue('/apples/services/accounts')
    accessSpy = jasmine.createSpy('access')
    execSpy = jasmine.createSpy('exec')
    pathExistsSpy = jasmine.createSpy('pathExists')
      .withArgs(accessSpy, '/apples/services/orders').and.returnValue(Promise.resolve(false))
      .withArgs(accessSpy, '/apples/services/products').and.returnValue(Promise.resolve(true))
      .withArgs(accessSpy, '/apples/services/accounts').and.returnValue(Promise.resolve(false))
    isJavascriptProjectSpy = jasmine.createSpy('isJavascriptProject')
      .withArgs(accessSpy, pathResolverSpy, '/apples/services/orders').and.returnValue(Promise.resolve(true))
      .withArgs(accessSpy, pathResolverSpy, '/apples/services/products').and.returnValue(Promise.resolve(true))
      .withArgs(accessSpy, pathResolverSpy, '/apples/services/accounts').and.returnValue(Promise.resolve(true))
    cloneRepoSpy = jasmine.createSpy('cloneRepoSpy')
  })

  it('should clone each repository if it is listed in apollo.config and does not already exist', () => {
    // 'silent' prevents the Listr library from rendering output during our tests.
    return servicesInit(apolloConfig, reporterSpy, parsedOutput, pathResolverSpy, accessSpy, execSpy, pathExistsSpy, isJavascriptProjectSpy, cloneRepoSpy, '/apples', 'silent')
      .then(() => {
        expect(cloneRepoSpy).toHaveBeenCalledWith(execSpy, 'https://github.com/BudgetDumpster/orders', 'services/orders')
        expect(cloneRepoSpy).not.toHaveBeenCalledWith(execSpy, 'https://github.com/BudgetDumpster/orders', 'services/products')
        expect(cloneRepoSpy).toHaveBeenCalledWith(execSpy, 'https://github.com/BudgetDumpster/accounts', 'services/accounts')
      })
  })

  it('should run an "npm install" for each service that is a javascript project', () => {
    // 'silent' prevents the Listr library from rendering output during our tests.
    return servicesInit(apolloConfig, reporterSpy, parsedOutput, pathResolverSpy, accessSpy, execSpy, pathExistsSpy, isJavascriptProjectSpy, cloneRepoSpy, '/apples', 'silent')
      .then(() => {
        expect(execSpy).toHaveBeenCalledWith('npm install', { cwd: '/apples/services/orders' })
        expect(execSpy).toHaveBeenCalledWith('npm install', { cwd: '/apples/services/products' })
        expect(execSpy).toHaveBeenCalledWith('npm install', { cwd: '/apples/services/accounts' })
      })
  })

  it('should throw an error if it cannot install dependencies because of not supporting the project type i.e. Javascript, Go, Ruby...', () => {
    const isJavascriptProjectSpy = jasmine.createSpy('isJavascriptProject')
      .withArgs(accessSpy, pathResolverSpy, '/apples/services/orders').and.returnValue(Promise.resolve(false))
      .withArgs(accessSpy, pathResolverSpy, '/apples/services/products').and.returnValue(Promise.resolve(true))
      .withArgs(accessSpy, pathResolverSpy, '/apples/services/accounts').and.returnValue(Promise.resolve(true))
    return servicesInit(apolloConfig, reporterSpy, parsedOutput, pathResolverSpy, accessSpy, execSpy, pathExistsSpy, isJavascriptProjectSpy, cloneRepoSpy, '/apples', 'silent')
      .then(() => fail())
      .catch((error: Error) => {
        expect(error.message).toBe('Orders is currently not a supported project type. We currently support javascript projects only but this package will happily take pull requests to support other languages.')
      })
  })
})
