let sinon = require('sinon')
let chai = require('chai')

const unIndexedRoutes = require('./unindexed-routes')

describe('unIndexedRoutes', () => {
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