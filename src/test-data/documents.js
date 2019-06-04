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

module.exports.testDocs = testDocs
module.exports.sortedDocs = sortedDocs
