/* eslint-env mocha */
const sinon = require('sinon')

const { fetchPersons } = require('./drupal-eight.js')
const s3CacheReader = require('../clients/s3-cache-reader.js')

const persons = require('../test-data/persons.js')
const offices = require('../test-data/officesRaw.js')
const fetchPersonsResult = require('../test-data/fetchPersons-result.js')

describe('Persons', () => {
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

  it('should sort in ascending order and add officeName in each Person object', async () => {
    getKeyStub.withArgs('offices').returns(Promise.resolve(offices))
    getKeyStub.withArgs('persons').returns(Promise.resolve(persons))

    const result = await fetchPersons({ order: 'ascending' })
    result.should.eql(fetchPersonsResult.ascendingOrder)
  })
})
