/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
let expect = chai.expect
chai.should()

const articleSearch = require('./article-search')
const cloudsearch = require('../clients/cloudsearch')

const defaultQueryParams = {
	"searchTerm": "test",
	"articleCategory": "Press release",
	"end": "3",
	"mode": "districtOffice",
	"national": "true",
	"office": "3948",
	"relatedOffice": "6386",
	"start": "0",
	"region": "Region IV",
	"program": "SBIC"
}

describe('articleSearch', () => {
	let stubRunSearch
	let stubBuildFilters
	before(() => {
		stubRunSearch = sinon.stub(cloudsearch, 'runSearch')
		spyBuildQuery = sinon.spy(articleSearch, 'buildQuery')
		spyBuildFilters = sinon.spy(articleSearch, 'buildFilters')
		spySetArticleSearchSort = sinon.spy(articleSearch, 'setArticleSearchSort')
	})
	afterEach(() => {
		stubRunSearch.reset()
	})
	after(() => {
		stubRunSearch.restore()
		spyBuildQuery.restore()
		spyBuildFilters.restore()
		spySetArticleSearchSort.restore()
	})
	describe('fetchArticles', () => {
		it('should invoke buildQuery()', async () => {
			stubRunSearch.returns({
				"status": {
					"timems": 2,
					"rid": "uMeq1fotJwq2RTs="
				},
					"hits": {
					"found": 0,
					"start": 0,
					"hit": []
				}
			})

			const params = Object.assign({}, defaultQueryParams)
			const result = await articleSearch.fetchArticles(params)
			spyBuildQuery.called.should.be.true
		})
		it('should invoke buildFilters()', async () => {
			stubRunSearch.returns({
				"status": {
					"timems": 2,
					"rid": "uMeq1fotJwq2RTs="
				},
					"hits": {
					"found": 0,
					"start": 0,
					"hit": []
				}
			})

			const params = Object.assign({}, defaultQueryParams)
			const result = await articleSearch.fetchArticles(params)
			spyBuildFilters.called.should.be.true
		})
		it('should invoke setArticleSearchSort()', async () => {
			stubRunSearch.returns({
				"status": {
					"timems": 2,
					"rid": "uMeq1fotJwq2RTs="
				},
					"hits": {
					"found": 0,
					"start": 0,
					"hit": []
				}
			})
			const params = Object.assign({}, defaultQueryParams)
			const result = await articleSearch.fetchArticles(params)
			spySetArticleSearchSort.called.should.be.true
		})
	})
	describe('buildQuery', () => {
		it('should format query string for cloudSearch()', () => {
			const params = Object.assign({}, defaultQueryParams)
			const expected = "(or title: 'test' article_body: 'test' summary: 'test' url: 'test')"
			const result = articleSearch.buildQuery(params.searchTerm)
			result.should.eql(expected)
		})
	})
	describe('buildFilters', () => {
		it('should format filter string for cloudsearch()', () => {

			const params = Object.assign({}, defaultQueryParams)
			const expected = "(and (or related_offices: '6386') (or office: '3948') (or region: 'Region IV') (or region: 'National') article_programs: 'SBIC' article_category: 'Press release')"
			const result = articleSearch.buildFilters(params)
			result.should.eql(expected)
		})
	})
	describe('setArticleSearchSort', () => {
		it('should set article search sort to "update desc" as default', () => {
			const params = Object.assign({}, defaultQueryParams)
			const expected = "updated desc"
			const result = articleSearch.setArticleSearchSort(params)
			result.should.eql(expected)
		})
		it('should set article search sort to "created desc"', () => {
			const params = Object.assign({}, defaultQueryParams, {
				"sortBy": "Authored on Date"
			})
			const expected = "created desc"
			const result = articleSearch.setArticleSearchSort(params)
			result.should.eql(expected)
		})
		it('should set article search sort to "title asc"', () => {
			const params = Object.assign({}, defaultQueryParams, {
				"sortBy": "Title",
				"order": "asc"
			})
			const expected = "title asc"
			const result = articleSearch.setArticleSearchSort(params)
			result.should.eql(expected)
		})
	})
})
