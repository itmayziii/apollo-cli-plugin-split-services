import { servicesStart } from './start'
import { ApolloConfig, GatewayConfig } from '../..'

describe('servicesStart', () => {
  let apolloConfig: ApolloConfig<GatewayConfig>
  let reporterSpy: any
  let parsedOutput: any
  let pathResolverSpy: jasmine.Spy
  let accessSpy: jasmine.Spy
  let isJavascriptProjectSpy: jasmine.Spy
  let concurrentSpy: jasmine.Spy
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
    reporterSpy = jasmine.createSpyObj('reporter', ['warn', 'error'])
    parsedOutput = jasmine.createSpyObj('parsedOutput', [''])
    pathResolverSpy = jasmine.createSpy('pathResolver')
      .withArgs('/giraffes', 'services/orders').and.returnValue('/giraffes/services/orders')
      .withArgs('/giraffes', 'services/products').and.returnValue('/giraffes/services/products')
      .withArgs('/giraffes', 'services/accounts').and.returnValue('/giraffes/services/accounts')
    accessSpy = jasmine.createSpy('access')
    isJavascriptProjectSpy = jasmine.createSpy('isJavascriptProject')
      .withArgs(accessSpy, pathResolverSpy, '/giraffes/services/orders').and.returnValue(Promise.resolve(false))
      .withArgs(accessSpy, pathResolverSpy, '/giraffes/services/products').and.returnValue(Promise.resolve(true))
      .withArgs(accessSpy, pathResolverSpy, '/giraffes/services/accounts').and.returnValue(Promise.resolve(false))
    concurrentSpy = jasmine.createSpy('concurrent')
  })

  it('should warn the user if the project type is not supported', () => {
    return servicesStart(apolloConfig, reporterSpy, parsedOutput, pathResolverSpy, accessSpy, isJavascriptProjectSpy, concurrentSpy, '/giraffes')
      .then(() => {
        expect(reporterSpy.warn).toHaveBeenCalledTimes(2)
        expect(reporterSpy.warn).toHaveBeenCalledWith('Unsupported project type for Orders service, service will not be started.')
        expect(reporterSpy.warn).not.toHaveBeenCalledWith('Unsupported project type for Products service, service will not be started.')
        expect(reporterSpy.warn).toHaveBeenCalledWith('Unsupported project type for Accounts service, service will not be started.')
        expect(concurrentSpy).toHaveBeenCalledTimes(1)
        expect(concurrentSpy).toHaveBeenCalledWith([
          { name: 'Products', command: 'cd /giraffes/services/products && npm run start' }
        ])
      })
  })

  it('should error if no services could be started', () => {
    const isJavascriptProjectSpy = jasmine.createSpy('isJavascriptProject')
      .withArgs(accessSpy, pathResolverSpy, '/giraffes/services/orders').and.returnValue(Promise.resolve(false))
      .withArgs(accessSpy, pathResolverSpy, '/giraffes/services/products').and.returnValue(Promise.resolve(false))
      .withArgs(accessSpy, pathResolverSpy, '/giraffes/services/accounts').and.returnValue(Promise.resolve(false))
    return servicesStart(apolloConfig, reporterSpy, parsedOutput, pathResolverSpy, accessSpy, isJavascriptProjectSpy, concurrentSpy, '/giraffes')
      .then(() => {
        expect(reporterSpy.error).toHaveBeenCalledTimes(1)
        expect(reporterSpy.error).toHaveBeenCalledWith('Failed to start any of the services.', { exit: 1 })
      })
  })

  it('should start each command in parallel with eachother', () => {
    const isJavascriptProjectSpy = jasmine.createSpy('isJavascriptProject')
      .withArgs(accessSpy, pathResolverSpy, '/giraffes/services/orders').and.returnValue(Promise.resolve(true))
      .withArgs(accessSpy, pathResolverSpy, '/giraffes/services/products').and.returnValue(Promise.resolve(true))
      .withArgs(accessSpy, pathResolverSpy, '/giraffes/services/accounts').and.returnValue(Promise.resolve(true))
    return servicesStart(apolloConfig, reporterSpy, parsedOutput, pathResolverSpy, accessSpy, isJavascriptProjectSpy, concurrentSpy, '/giraffes')
      .then(() => {
        expect(concurrentSpy).toHaveBeenCalledTimes(1)
        expect(concurrentSpy).toHaveBeenCalledWith([
          { name: 'Orders', command: 'cd /giraffes/services/orders && npm run start' },
          { name: 'Products', command: 'cd /giraffes/services/products && npm run start' },
          { name: 'Accounts', command: 'cd /giraffes/services/accounts && npm run start' }
        ])
      })
  })
})
