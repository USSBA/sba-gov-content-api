/* eslint-env mocha */
let chai = require('chai')
let expect = chai.expect

const { getSuggestedRoutes } = require('./suggested-routes.js')
const suggestedRoutes = require('./suggested-routes.json')

describe('suggestedRoutes', () => {
  it('should return json data', () => {
    const result = getSuggestedRoutes()
    const expected = suggestedRoutes
    expect(result).to.deep.equal(expected)
  })
  describe('item.route', () => {
    it('should exist', () => {
      suggestedRoutes.forEach(item => item.hasOwnProperty('route').should.be.true)
    })
    it('should have a "type" of "string"', () => {
      const expected = 'string'
      suggestedRoutes.forEach(item => expect(typeof item.route).to.equal(expected))
    })
  })
  describe('item.cardMessage', () => {
    it('should exist', () => {
      suggestedRoutes.forEach(item => item.hasOwnProperty('cardMessage').should.be.true)
    })
    it('should have a "type" of "string"', () => {
      const expected = 'string'
      suggestedRoutes.forEach(item => expect(typeof item.cardMessage).to.equal(expected))
    })
  })
  describe('item.buttonLabel', () => {
    it('should exist', () => {
      suggestedRoutes.forEach(item => item.hasOwnProperty('buttonLabel').should.be.true)
    })
    it('should have a "type" of "string"', () => {
      const expected = 'string'
      suggestedRoutes.forEach(item => expect(typeof item.buttonLabel).to.equal(expected))
    })
  })
  describe('item.keywords', () => {
    it('should exist', () => {
      suggestedRoutes.forEach(item => item.hasOwnProperty('keywords').should.be.true)
    })
    it('should have a "type" of "array"', () => {
      suggestedRoutes.forEach(item => Array.isArray(item.keywords).should.be.true)
    })
    it('should have members that have a "type" of "string"', () => {
      suggestedRoutes.forEach(item => {
        const expected = 'string'
        item.keywords.forEach(keyword => expect(typeof keyword).to.equal(expected))
      })
    })
  })
})
