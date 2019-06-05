/* eslint-env mocha */
const expect = require('chai').expect
const sinon = require('sinon')

const { fetchArticles } = require('./articles.js')
const s3CacheReader = require('../clients/s3-cache-reader.js')

const { articles } = require('../test-data/articles.js')

describe('Searching for articles', () => {
  let getKeyStub

  before(() => {
    getKeyStub = sinon.stub(s3CacheReader, 'getKey')
  })

  afterEach(() => {
    getKeyStub.reset()
  })

  after(() => {
    getKeyStub.restore()
  })

  it('should return all articles when NOT given any parameters', async () => {
    getKeyStub.withArgs('articles').returns(Promise.resolve(articles))

    const results = await fetchArticles()
    const resultsTotal = results['count']
    const resultsArticles = results['items']

    expect(results).to.be.a('object')
    expect(resultsTotal).to.be.a('number')
    expect(resultsTotal).to.equal(articles.length)
    expect(resultsArticles).to.be.a('array')
    expect(resultsArticles).to.have.lengthOf(resultsTotal)
    expect(resultsArticles).to.have.lengthOf(articles.length)
  })
  it("should return only matching articles when given the 'articleCategory' parameter", async () => {
    getKeyStub.withArgs('articles').returns(Promise.resolve(articles))

    const category = 'example category'
    const results = await fetchArticles({ articleCategory: category })
    const resultsTotal = results['count']
    const resultsArticles = results['items']

    expect(resultsTotal).to.equal(2)
    expect(resultsArticles).to.have.lengthOf(resultsTotal)
    resultsArticles.forEach(function (article) {
      expect(article.category).to.include(category)
    })
  })
  it("should return only matching articles when given the 'program' parameter", async () => {
    getKeyStub.withArgs('articles').returns(Promise.resolve(articles))

    const program = 'FAKE PROGRAM'
    const results = await fetchArticles({ program: program})
    const resultsTotal = results['count']
    const resultsArticles = results['items']

    expect(resultsTotal).to.equal(1)
    expect(resultsArticles).to.have.lengthOf(resultsTotal)
    resultsArticles.forEach(function (article) {
      expect(article.programs).to.include(program)
    })
  })
  it("should return only matching articles when given the 'searchTerm' parameter", async () => {
    getKeyStub.withArgs('articles').returns(Promise.resolve(articles))

    const keyword = 'fancy'
    const results = await fetchArticles({ searchTerm: keyword})
    const resultsTotal = results['count']
    const resultsArticles = results['items']

    expect(resultsTotal).to.equal(2)
    expect(resultsArticles).to.have.lengthOf(resultsTotal)
    resultsArticles.forEach(function (article) {
      expect(article.title.toLowerCase()).to.include(keyword)
    })
  })
  it('should return only matching articles when given multiple parameter', async () => {
    getKeyStub.withArgs('articles').returns(Promise.resolve(articles))

    const keyword = 'fancy'
    const program = 'FAKE PROGRAM'
    const results = await fetchArticles({ searchTerm: keyword, program: program })
    const resultsTotal = results['count']
    const resultsArticles = results['items']

    expect(resultsTotal).to.equal(1)
    expect(resultsArticles).to.have.lengthOf(resultsTotal)
    resultsArticles.forEach(function (article) {
      expect(article.title.toLowerCase()).to.include(keyword)
      expect(article.programs).to.include(program)
    })
  })
  it('should return all articles when given an INVALID parameter', async () => {
    getKeyStub.withArgs('articles').returns(Promise.resolve(articles))

    const control = await fetchArticles()
    const controlTotal = control['count']
    const controlArticles = control['items']
    const results = await fetchArticles({ foo: 'bar' })
    const resultsTotal = results['count']
    const resultsArticles = results['items']

    expect(resultsTotal).to.equal(controlTotal)
    resultsArticles.forEach(function (article, index) {
      expect(article.id).to.equal(controlArticles[index].id)
    })
  })
  it('should return only the matching articles for the VALID parameter when given VALID and INVALID parameters', async () => {
    getKeyStub.withArgs('articles').returns(Promise.resolve(articles))

    const program = 'FAKE PROGRAM'
    const control = await fetchArticles({ program: program })
    const controlTotal = control['count']
    const controlArticles = control['items']
    const results = await fetchArticles({ program: program, foo: 'bar' })
    const resultsTotal = results['count']
    const resultsArticles = results['items']

    expect(resultsTotal).to.equal(controlTotal)
    resultsArticles.forEach(function (article, index) {
      expect(article.id).to.equal(controlArticles[index].id)
    })
  })
})
