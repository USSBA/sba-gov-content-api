let sinon = require('sinon')
let chai = require('chai')
let expect = chai.expect

const { getUnIndexedRoutes } = require('./unindexed-routes.js')
const unIndexedRoutes = require('./unindexed-routes.json')

describe('unIndexedRoutes', () => {
	it('should return json data', () => {
		const result = getUnIndexedRoutes()
		const expected = unIndexedRoutes
		expect(result).to.deep.equal(expected)
	})
	it('unIndexedRoutes items should have a "title" property', () => {
		unIndexedRoutes.forEach(route => route.hasOwnProperty('title').should.be.true)
	})
	it('unIndexedRoutes items should have a "description" property', () => {
		unIndexedRoutes.forEach(route => route.hasOwnProperty('description').should.be.true)
	})
	it('unIndexedRoutes items should have a "url" property', () => {
		unIndexedRoutes.forEach(route => route.hasOwnProperty('url').should.be.true)
	})
})
