/* eslint-env mocha */
const chai = require('chai')

const { sortDocumentsByDate } = require('./documents.js')
const {testDocs, sortedDocs} = require('../test-data/documents.js')

describe('Document sorting', () => {
  it('should sort and filter documents by effective date', done => {
    let docs = sortDocumentsByDate(testDocs)
    chai.expect(docs).to.deep.equal(sortedDocs)
    done()
  })
})
