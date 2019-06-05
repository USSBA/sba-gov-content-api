/* eslint-env mocha */
const chai = require('chai')
const expect = require('chai').expect
const sinon = require('sinon')

const { fetchDocuments, sortDocumentsByDate } = require('./documents.js')
const s3CacheReader = require('../clients/s3-cache-reader.js')

const {testDocs, sortedDocs} = require('../test-data/documents.js')
const { documents } = require('../test-data/documents.js')

describe('Document sorting', () => {
  it('should sort and filter documents by effective date', done => {
    let docs = sortDocumentsByDate(testDocs)
    chai.expect(docs).to.deep.equal(sortedDocs)
    done()
  })
})

describe('Searching for documents', () => {
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

  it('should return all documents when NOT given any parameters', async () => {
    getKeyStub.withArgs('documents').returns(Promise.resolve(documents))

    const results = await fetchDocuments()
    const resultsTotal = results['count']
    const resultsDocuments = results['items']

    expect(results).to.be.a('object')
    expect(resultsTotal).to.be.a('number')
    expect(resultsTotal).to.equal(documents.length)
    expect(resultsDocuments).to.be.a('array')
    expect(resultsDocuments).to.have.lengthOf(resultsTotal)
    expect(resultsDocuments).to.have.lengthOf(documents.length)
  })
  it("should return only the matching documents when provided a 'searchTerm' parameter", async () => {
    getKeyStub.withArgs('documents').returns(Promise.resolve(documents))

    const keyword = 'harvey'
    const results = await fetchDocuments({ searchTerm: keyword })
    const resultsTotal = results['count']
    const resultsDocuments = results['items']

    expect(resultsTotal).to.equal(2)
    expect(resultsDocuments).to.have.lengthOf(2)
    resultsDocuments.forEach(function (document) {
      expect(document.title.toLowerCase()).to.include(keyword)
    })
  })
  it("should return only the matching documents when provided with a 'documentType' parameter", async () => {
    getKeyStub.withArgs('documents').returns(Promise.resolve(documents))

    const documentType = 'example document type'
    const results = await fetchDocuments({ documentType: documentType })
    const resultsTotal = results['count']
    const resultsDocuments = results['items']

    expect(resultsTotal).to.equal(1)
    expect(resultsDocuments).to.have.lengthOf(resultsTotal)
    expect(resultsDocuments[0].documentIdType).to.equal(documentType)
  })
  it("should return only the matching documents when provided with a 'program' parameter", async () => {
    getKeyStub.withArgs('documents').returns(Promise.resolve(documents))

    const program = 'Test program'
    const results = await fetchDocuments({ program: program })
    const resultsTotal = results['count']
    const resultsDocuments = results['items']

    expect(resultsTotal).to.equal(2)
    resultsDocuments.forEach(function (document) {
      expect(document.programs).to.include(program)
    })
  })
  it("should return only the matching documents when provided with a 'documentActivity' parameter", async () => {
    getKeyStub.withArgs('documents').returns(Promise.resolve(documents))

    const activity = 'contracting stuff'
    const results = await fetchDocuments({ documentActivity: activity })
    const resultsTotal = results['count']
    const resultsDocuments = results['items']

    expect(resultsTotal).to.equal(2)
    expect(resultsDocuments).to.have.lengthOf(resultsTotal)
    resultsDocuments.forEach(function (document) {
      expect(document.activitys).to.include(activity)
    })
  })
  it('should return only the matching documents when provided with multiple valid parameters', async () => {
    getKeyStub.withArgs('documents').returns(Promise.resolve(documents))

    const results = await fetchDocuments({ documentActivity: 'activity', searchTem: 'harvey' })
    const resultsTotal = results['count']
    const resultsDocuments = results['items']

    expect(resultsTotal).to.equal(1)
    expect(resultsDocuments).to.have.lengthOf(resultsTotal)
  })
  it('should return all documents when provided with invalid parameters', async () => {
    getKeyStub.withArgs('documents').returns(Promise.resolve(documents))

    const control = await fetchDocuments()
    const controlTotal = control['count']
    const controlDocuments = control['items']
    const results = await fetchDocuments({ foo: 'bar' })
    const resultsTotal = results['count']
    const resultsDocuments = results['items']

    expect(resultsTotal).to.equal(controlTotal)
    resultsDocuments.forEach(function (document, index) {
      expect(document.id).to.equal(controlDocuments[index].id)
    })
  })
  it("should return only the matching documents for the 'program' parameter when provided with a 'program' parameter and invalid parameter", async () => {
    getKeyStub.withArgs('documents').returns(Promise.resolve(documents))

    const keyword = 'harvey'
    const control = await fetchDocuments({ searchTerm: keyword })
    const controlTotal = control['count']
    const controlDocuments = control['items']
    const results = await fetchDocuments({ searchTerm: keyword, foo: 'bar' })
    const resultsTotal = results['count']
    const resultsDocuments = results['items']

    expect(resultsTotal).to.equal(controlTotal)
    resultsDocuments.forEach(function (document, index) {
      expect(document.id).to.equal(controlDocuments[index].id)
    })
  })
})
