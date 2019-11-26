/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()
let expect = chai.expect

let contentHandler
let events = require('./service/events.js')
const lookupArticles = require('./service/articles.js')
const lookupDistrictOfficeArticles = require('./service/article-search.js')
const HttpStatus = require('http-status-codes')
const config = require('./config.js')

describe('# Content Handler', () => {
  let eventStub, getBackendSourceToggleStub

  before(() => {
    eventStub = sinon.stub(events, 'fetchEventById')
    getBackendSourceToggleStub = sinon.stub(config.eventsApi, 'getBackendSourceToggle')
    contentHandler = require('./content.js') // this is a small workaround for the way the content handler imports service modules
  })

  afterEach(() => {
    eventStub.reset()
    getBackendSourceToggleStub.reset()
  })

  after(() => {
    eventStub.restore()
    getBackendSourceToggleStub.restore()
  })

  // TODO: remove this describe block when feature flag, getBackendSourceToggle, for events backend is removed
  // fetchEventById will no longer be a function
  describe('fetchContentById for event id mapping', () => {
    it('should respond with event data when a valid id is given in the path', async () => {
      let data = { title: 'thisisatitle' }

      getBackendSourceToggleStub.returns('false')
      eventStub.withArgs(1).returns(data)

      let expected = { statusCode: HttpStatus.OK, body: data }
      let result = await contentHandler.fetchContentById({ type: 'event', id: 1 })

      expect(result).to.deep.equal(expected)
    })

    it('should respond with a 404 when an invalid id is given in the path', async () => {
      getBackendSourceToggleStub.returns('false')
      eventStub.returns(null)

      let expected = { statusCode: HttpStatus.NOT_FOUND, body: 'Unable to find event with id 1' }
      let result = await contentHandler.fetchContentById({ type: 'event', id: 1 })

      expect(result).to.deep.equal(expected)
    })

    it('should display invalid endpoint message for event data with getBackendSourceToggle set to true', async () => {
      const id = 1
      getBackendSourceToggleStub.returns('true')

      let expected = { statusCode: HttpStatus.NOT_FOUND, body: 'Unknown type event' }
      let result = await contentHandler.fetchContentById({ type: 'event', id })

      expect(result).to.deep.equal(expected)
    })
  })

  describe('fetchContentById', () => {
    beforeEach(() => {
      getBackendSourceToggleStub.returns('true')
    })

    it('should display invalid endpoint message for unknown data type', async () => {
      const invalidType = 'fake data type'
      const id = 1

      let expected = { statusCode: HttpStatus.NOT_FOUND, body: `Unknown type ${invalidType}` }
      let result = await contentHandler.fetchContentById({ type: invalidType, id })

      expect(result).to.deep.equal(expected)
    })

    it('should display invalid endpoint message when no type and/or id is declared', async () => {
      let expected = { statusCode: HttpStatus.BAD_REQUEST, body: `Incorrect request format: missing type or id` }
      let result = await contentHandler.fetchContentById()

      expect(result).to.deep.equal(expected)
    })
  })

  describe('fetchContentByType', () => {
    beforeEach(() => {
      getBackendSourceToggleStub.returns('true')
    })
    it('should display invalid endpoint message for unknown data type', async () => {
      const dataType = 'fake data type'

      let expected = { statusCode: HttpStatus.NOT_FOUND, body: `Unknown type ${dataType}` }
      let result = await contentHandler.fetchContentByType({ type: dataType })

      expect(result).to.deep.equal(expected)
    })

    it('should display invalid endpoint message when no type is declared', async () => {
      let expected = { statusCode: HttpStatus.BAD_REQUEST, body: `Incorrect request format: missing type` }
      let result = await contentHandler.fetchContentByType()

      expect(result).to.deep.equal(expected)
    })
    describe('fetchArticles Permission Toggle', () => {
      it('should return "articles.json response" when mode is empty', async () => {
        const fetchLookupArticlesStub = sinon.stub(lookupArticles, 'fetchArticles')
        fetchLookupArticlesStub.returns('lookupArticlesResponse')
        const expected = { statusCode: HttpStatus.OK, body: `lookupArticlesResponse` }
        const result = await contentHandler.fetchContentByType({ type: 'articles' })
        fetchLookupArticlesStub.restore()
        expect(result).to.deep.equal(expected)
      })
      it('should return "articles.json response" when mode is set to "articleLookup"', async () => {
        const fetchLookupArticlesStub = sinon.stub(lookupArticles, 'fetchArticles')
        fetchLookupArticlesStub.returns('articlesResponse')
        const expected = { statusCode: HttpStatus.OK, body: `articlesResponse` }
        const result = await contentHandler.fetchContentByType({ type: 'articles' }, { mode: 'articleLookup' })
        fetchLookupArticlesStub.restore()
        expect(result).to.deep.equal(expected)
      })
      it('should return "article-search.json response" when mode is set to "districtOffice"', async () => {
        const fetchLookupDistrictOfficeArticlesStub = sinon.stub(lookupDistrictOfficeArticles, 'fetchArticles')
        fetchLookupDistrictOfficeArticlesStub.returns('districtOfficeArticlesResponse')
        const expected = { statusCode: HttpStatus.OK, body: `districtOfficeArticlesResponse` }
        const result = await contentHandler.fetchContentByType({ type: 'articles' }, { mode: 'districtOffice' })
        fetchLookupDistrictOfficeArticlesStub.restore()
        expect(result).to.deep.equal(expected)
      })
    })
  })
})

/* eslint-enable no-unused-expressions */
