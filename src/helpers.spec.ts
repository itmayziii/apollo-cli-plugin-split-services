import { getConfigPath, pathExists } from './helpers'
import * as fs from 'fs'

describe('getConfigPath', () => {
  it('should return the apollo.config.js file from the current working directory if a config path is not provided',
    () => {
      const pathResolveFnSpy = jasmine.createSpy('pathResolve').withArgs('/apples', 'apollo.config.js').and.returnValue('/apples/apollo.config.js')
      const actual = getConfigPath(pathResolveFnSpy, '/apples')
      const expected = '/apples/apollo.config.js'
      expect(actual).toBe(expected)
    })

  it('should simply return the passed in config path if it is an absolute path', () => {
    const pathResolveFnSpy = jasmine.createSpy('pathResolve')
    const actual = getConfigPath(pathResolveFnSpy, '/apples', '/Users/Tmay/bananas/apollo.config.js')
    const expected = '/Users/Tmay/bananas/apollo.config.js'
    expect(actual).toBe(expected)
  })

  it('should return the config path relative to the current directory if the config path is relative', () => {
    const pathResolveFnSpy = jasmine.createSpy('pathResolve').withArgs('/apples', 'bananas/apollo.config.js').and.returnValue('/apples/bananas/apollo.config.js')
    const actual = getConfigPath(pathResolveFnSpy, '/apples', 'bananas/apollo.config.js')
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
      .then((actual) => {
        expect(actual).toBeFalse()
      })
  })
})
