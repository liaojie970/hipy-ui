import { validUsername, validURL, validLowerCase, validUpperCase, validAlphabets, isExternal, validEmail, isString, isArray } from '@/utils/validate.js'
describe('Utils:validate', () => {
  it('validUsername', () => {
    expect(validUsername('admin')).toBe(true)
    expect(validUsername('editor')).toBe(true)
    expect(validUsername('xxxx')).toBe(false)
  })
  it('validURL', () => {
    expect(validURL('https://github.com/PanJiaChen/vue-element-admin')).toBe(true)
    expect(validURL('http://github.com/PanJiaChen/vue-element-admin')).toBe(true)
    expect(validURL('github.com/PanJiaChen/vue-element-admin')).toBe(false)
  })
  it('validLowerCase', () => {
    expect(validLowerCase('abc')).toBe(true)
    expect(validLowerCase('Abc')).toBe(false)
    expect(validLowerCase('123abc')).toBe(false)
  })
  it('validUpperCase', () => {
    expect(validUpperCase('ABC')).toBe(true)
    expect(validUpperCase('Abc')).toBe(false)
    expect(validUpperCase('123ABC')).toBe(false)
  })
  it('validAlphabets', () => {
    expect(validAlphabets('ABC')).toBe(true)
    expect(validAlphabets('Abc')).toBe(true)
    expect(validAlphabets('123aBC')).toBe(false)
  })
  it('isExternal', () => {
    expect(isExternal('https://github.com')).toBe(true)
    expect(isExternal('http://github.com')).toBe(true)
    expect(isExternal('mailto:a@b.com')).toBe(true)
    expect(isExternal('tel:123456')).toBe(true)
    expect(isExternal('/dashboard')).toBe(false)
    expect(isExternal('github.com')).toBe(false)
  })
  it('validEmail', () => {
    expect(validEmail('a@b.com')).toBe(true)
    expect(validEmail('user.name+tag@example.co.uk')).toBe(true)
    expect(validEmail('a@b')).toBe(false)
    expect(validEmail('not-an-email')).toBe(false)
  })
  it('isString', () => {
    expect(isString('abc')).toBe(true)
    expect(isString(new String('abc'))).toBe(true)
    expect(isString(123)).toBe(false)
    expect(isString(null)).toBe(false)
    expect(isString([])).toBe(false)
  })
  it('isArray', () => {
    expect(isArray([])).toBe(true)
    expect(isArray([1, 2])).toBe(true)
    expect(isArray('abc')).toBe(false)
    expect(isArray({})).toBe(false)
    expect(isArray(null)).toBe(false)
  })
})
