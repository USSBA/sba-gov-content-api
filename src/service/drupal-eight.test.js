/* eslint-env mocha */
const chai = require('chai')

const { sortDocumentsByDate } = require('./drupal-eight.js')

let testDocs = [{
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

let sortedDocs = [{
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
