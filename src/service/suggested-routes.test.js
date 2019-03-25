let sinon = require('sinon')
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
	it('suggestedRoutes items should have a "title" property', () => {
		suggestedRoutes.forEach(route => route.hasOwnProperty('title').should.be.true)
	})
	it('suggestedRoutes items should have a "description" property', () => {
		suggestedRoutes.forEach(route => route.hasOwnProperty('description').should.be.true)
	})
	it('suggestedRoutes items should have a "url" property', () => {
		suggestedRoutes.forEach(route => route.hasOwnProperty('url').should.be.true)
	})
	it('suggestedRoutes items should have a "keywords" property', () => {
		suggestedRoutes.forEach(route => route.hasOwnProperty('keywords').should.be.true)
	})
	it('suggestedRoutes "keyword" should have type of Array', () => {
		suggestedRoutes.forEach(route => Array.isArray(route.keywords).should.be.true)
	})
})
