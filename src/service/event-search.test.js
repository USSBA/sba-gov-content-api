/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()
let expect = chai.expect

let eventSearch = require('./event-search.js')

let exampleCloudSearchEmptyResponse = {
  status: { timems: 31, rid: '//mU9b4s+C0KlCOm' },
  hits: { found: 0, start: 0, hit: [] }
}

describe('eventSearch', () => {
	let stubGet
	let stubRunSearch
	before(() => {
		stubRunSearch = sinon.stub(eventSearch, 'runSearch')
	})
	afterEach(() => {
		stubRunSearch.reset()
	})
	after(() => {
		stubRunSearch.restore()
	})
	describe('buildQuery', () => {
		it('should format the query to search the fields, description, name and summary', () => {
			const expected = "description: 'test' name: 'test' summary: 'test'"
			const result = eventSearch.buildQuery('test')
			result.should.equal(expected)
		})
	})
	describe('buildParams', () => {
		it('should build a parameters object', () => {
			const params = {
				q: 'test'
			}
			const expected = {
				query: 'description: \'test\' name: \'test\' summary: \'test\'',
				return: '_all_fields',
				sort: 'title asc',
				queryParser: 'structured',
				size: 20,
				start: 0
			}
			const result = eventSearch.buildParams(params, {})
		})
	})
	describe('fetchEvents', () => {
		it('should fetch an event', async () => {
			const params = {
				q: 'test'
			}
			stubRunSearch.returns(exampleCloudSearchEmptyResponse)
			console.log('A--', await eventSearch.fetchEvents(params))
		})
	})
})