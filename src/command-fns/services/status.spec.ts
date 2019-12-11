import { servicesStatus } from './status'
import { ApolloConfig, GatewayConfig } from '../../interfaces/apollo-config'

describe('servicesStart', () => {
  let apolloConfig: ApolloConfig<GatewayConfig>
  let reporterSpy: any
  let parsedOutput: any
  let pathSpy: jasmine.SpyObj<any>
  let randomColorFn: jasmine.Spy
  let randomLogColorSpy: jasmine.Spy
  let execSpy: jasmine.Spy
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
    reporterSpy = jasmine.createSpyObj('reporter', ['log', 'warn'])
    parsedOutput = jasmine.createSpyObj('parsedOutput', [''])
    pathSpy = jasmine.createSpyObj(['resolve'])
    pathSpy.resolve
      .withArgs('/giraffes', 'services/orders').and.returnValue('/giraffes/services/orders')
      .withArgs('/giraffes', 'services/products').and.returnValue('/giraffes/services/products')
      .withArgs('/giraffes', 'services/accounts').and.returnValue('/giraffes/services/accounts')
    randomColorFn = jasmine.createSpy('randomColorFn')
    randomLogColorSpy = jasmine.createSpy('randomLogColor')
      .and.returnValue(randomColorFn)
    execSpy = jasmine.createSpy('exec')
      .withArgs('git status', { cwd: '/giraffes/services/orders' }).and.returnValue(Promise.resolve({ stdout: 'On branch master' }))
      .withArgs('git status', { cwd: '/giraffes/services/products' }).and.returnValue(Promise.resolve({ stdout: 'On branch feature/special-products' }))
      .withArgs('git status', { cwd: '/giraffes/services/accounts' }).and.returnValue(Promise.resolve({ stdout: 'On branch fix/missing-username' }))
  })

  it('should log the output of "git status" for each service', () => {
    return servicesStatus(apolloConfig, reporterSpy, parsedOutput, pathSpy, randomLogColorSpy, execSpy, '/giraffes')
      .then(() => {
        expect(randomColorFn).toHaveBeenCalledTimes(6)
        expect(reporterSpy.log).toHaveBeenCalledTimes(9)

        expect(randomColorFn).toHaveBeenCalledWith('########################### Orders ###########################')
        expect(reporterSpy.log).toHaveBeenCalledWith('On branch master')
        expect(randomColorFn).toHaveBeenCalledWith('########################### End Orders ###########################\n')
        expect(randomColorFn).toHaveBeenCalledWith('########################### Products ###########################')
        expect(reporterSpy.log).toHaveBeenCalledWith('On branch feature/special-products')
        expect(randomColorFn).toHaveBeenCalledWith('########################### End Products ###########################\n')
        expect(randomColorFn).toHaveBeenCalledWith('########################### Accounts ###########################')
        expect(reporterSpy.log).toHaveBeenCalledWith('On branch fix/missing-username')
        expect(randomColorFn).toHaveBeenCalledWith('########################### End Accounts ###########################\n')
      })
  })
})
