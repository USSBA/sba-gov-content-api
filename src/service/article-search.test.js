/* eslint-env mocha */
const expect = require('chai').expect
const sinon = require('sinon')
const articleSearch = require('./articles.js')
const config = require('../config.js')
const cloudsearch = require('../clients/cloudsearch.js')

describe.skip('articles', () => {
  it('fetchArticles', async () => {
  	/*

  	To Do: Address this test. The runSearch method can't be properly stubbed as it kicks the following error:

	InvalidEndpoint: AWS.CloudSearchDomain requires an explicit `endpoint' configuration option.

	*/

  	const runSearchStub = sinon.stub(cloudsearch, 'runSearch')
  	runSearchStub.returns({
  		'hits': []
  	})
  	await articleSearch.fetchArticles({})
  })
})
