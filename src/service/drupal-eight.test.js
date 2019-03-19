/* eslint-env mocha */
const chai = require('chai')
const sinon = require('sinon')
const expect = chai.expect

const { fetchPersons, sortDocumentsByDate } = require('./drupal-eight.js')
const drupalEight = require('./drupal-eight.js')
const s3CacheReader = require('../clients/s3-cache-reader.js')
const persons = require('../test-data/persons.js')
const offices = require('../test-data/officesRaw.js')

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

describe.only('Persons', () => {
  let getKeyStub

  before(() => {
    getKeyStub = sinon.stub(s3CacheReader, 'getKey')
    // drupalEight = require('./drupal-eight.js')
    // getKeyStub = sinon.stub(s3CacheReader, 'getKey')
  })

  afterEach(() => {
    getKeyStub.reset()
  })

  after(() => {
    getKeyStub.restore()
  })

  it('should sort and add officeName in each Person object', async (done) => {
    // getKeyStub.reset()
    getKeyStub.withArgs('offices').returns(offices)
    // getKeyStub.withArgs('persons').returns(persons)
    // getKeyStub.withArgs('persons').returns(Promise.resolve(persons))

    const result = await drupalEight.fetchPersons()
    console.log('1254', result)
  })
})