/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')

const { fetchPersons, sortDocumentsByDate } = require('./drupal-eight.js')
const s3CacheReader = require('../clients/s3-cache-reader.js')

const persons = require('../test-data/persons.js')
const offices = require('../test-data/officesRaw.js')
const fetchPersonsResult = require('../test-data/fetchPersons-result.js')

const testDocs = [{
  files: [{
    effectiveDate: '2018-01-01'
  },
  {
    effectiveDate: '2017-01-01'
  }
  ]
},

{
  files: [{
    effectiveDate: '1990-01-01'
  },
  {
    effectiveDate: '2016-01-01'
  }
  ]
},

{
  files: [{
    effectiveDate: '2020-01-01'
  },
  {
    effectiveDate: '2015-01-01'
  }
  ]
},

{
  files: [{
    effectiveDate: null
  },
  {
    effectiveDate: null
  }
  ]
},

{
  files: [{
    effectiveDate: '2050-01-01'
  },
  {
    effectiveDate: '2090-04-05'
  }
  ]
}
]

const sortedDocs = [{
  files: [{
    effectiveDate: '2018-01-01'
  },
  {
    effectiveDate: '2017-01-01'
  }
  ]
},
{
  files: [{
    effectiveDate: '1990-01-01'
  },
  {
    effectiveDate: '2016-01-01'
  }
  ]
},
{
  files: [{
    effectiveDate: '2020-01-01'
  },
  {
    effectiveDate: '2015-01-01'
  }
  ]
},
{
  files: [{
    effectiveDate: null
  },
  {
    effectiveDate: null
  }
  ]
},
{
  files: [{
    effectiveDate: '2050-01-01'
  },
  {
    effectiveDate: '2090-04-05'
  }
  ]
}
]

describe('Document sorting', () => {
  it('should sort and filter documents by effective date', done => {
    let docs = sortDocumentsByDate(testDocs)
    chai.expect(docs).to.deep.equal(sortedDocs)
    done()
  })
})

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

  it('should sort in descending order and add officeName in each Person object', async () => {
    getKeyStub.withArgs('offices').returns(Promise.resolve(offices))
    getKeyStub.withArgs('persons').returns(Promise.resolve(persons))

    const result = await fetchPersons({ order: 'descending' })
    result.should.eql(fetchPersonsResult.descendingOrder)
  })
})
