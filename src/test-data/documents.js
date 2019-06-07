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

const documents = [
  {
    'activitys': [
      'activity'
    ],
    'documentIdNumber': '5000-4021',
    'documentIdType': 'example document type',
    'files': [
      {
        'id': 1111,
        'type': 'docFile',
        'effectiveDate': '2017-08-28',
        'expirationDate': null,
        'fileUrl': '/sites/default/files/2017-09/5000-4021.pdf',
        'version': '1'
      }
    ],
    'officeLink': {
      'url': '/offices/headquarters/oca',
      'title': 'Office of Capital Access'
    },
    'ombNumber': {},
    'programs': [
      '7(a)',
      'CDC/504',
      'Microlending',
      'Community Advantage',
      'Disaster'
    ],
    'summary': 'SBA is providing deferments for SBA 7(a) and 504 Business Loans, Microloans, and Disaster Loans for businesses adversely affected by Hurricane Harvey.',
    'type': 'document',
    'title': 'SBA Provides Loan Deferments in Hurricane Harvey Affected Areas',
    'id': 1111,
    'updated': 1512075693,
    'created': 1504815259,
    'langCode': 'en',
    'url': '/document/policy-notice-5000-4021-sba-provides-loan-deferments-hurricane-harvey-affected-areas'
  },
  {
    'activitys': [
      'contracting stuff'
    ],
    'documentIdNumber': '5000-4021',
    'documentIdType': 'Policy notice',
    'files': [
      {
        'id': 1112,
        'type': 'docFile',
        'effectiveDate': '2017-08-28',
        'expirationDate': null,
        'fileUrl': '/sites/default/files/2017-09/5000-4021.pdf',
        'version': '1'
      }
    ],
    'officeLink': {
      'url': '/offices/headquarters/oca',
      'title': 'Office of Capital Access'
    },
    'ombNumber': {},
    'programs': [
      '7(a)',
      'CDC/504',
      'Microlending',
      'Community Advantage',
      'Disaster',
      'Test program'
    ],
    'summary': 'SBA is providing deferments for SBA 7(a) and 504 Business Loans, Microloans, and Disaster Loans for businesses adversely affected by Hurricane Harvey.',
    'type': 'document',
    'title': 'SBA Provides Loan Deferments in Hurricane Harvey Affected Areas',
    'id': 1112,
    'updated': 1512075693,
    'created': 1504815259,
    'langCode': 'en',
    'url': '/document/policy-notice-5000-4021-sba-provides-loan-deferments-hurricane-harvey-affected-areas'
  },
  {
    'activitys': [
      'contracting stuff'
    ],
    'documentIdNumber': '5000-4021',
    'documentIdType': 'Policy notice',
    'files': [
      {
        'id': 1113,
        'type': 'docFile',
        'effectiveDate': '2017-08-28',
        'expirationDate': null,
        'fileUrl': '/sites/default/files/2017-09/5000-4021.pdf',
        'version': '1'
      }
    ],
    'officeLink': {
      'url': '/offices/headquarters/oca',
      'title': 'Office of Capital Access'
    },
    'ombNumber': {},
    'programs': [
      'Test program'
    ],
    'summary': 'A summary',
    'type': 'document',
    'title': 'Some SBA Document',
    'id': 1113,
    'updated': 1512075693,
    'created': 1504815259,
    'langCode': 'en',
    'url': '/document/some-doc'
  },
  {
    'activitys': [
      'paging activity'
    ],
    'documentIdNumber': '5000-4021',
    'documentIdType': 'full type',
    'files': [
      {
        'id': 1114,
        'type': 'docFile',
        'effectiveDate': '2017-08-28',
        'expirationDate': null,
        'fileUrl': '/sites/default/files/2017-09/5000-4021.pdf',
        'version': '1'
      }
    ],
    'officeLink': {
      'url': '/offices/headquarters/oca',
      'title': 'Office of Capital Access'
    },
    'ombNumber': {},
    'programs': [
      'paging program'
    ],
    'summary': 'A summary',
    'type': 'document',
    'title': 'Page of a Document',
    'id': 1114,
    'updated': 1512075693,
    'created': 1504815259,
    'langCode': 'en',
    'url': '/document/some-doc'
  },
  {
    'activitys': [
      'paging activity'
    ],
    'documentIdNumber': '5000-4021',
    'documentIdType': 'full type',
    'files': [
      {
        'id': 1115,
        'type': 'docFile',
        'effectiveDate': '2017-08-28',
        'expirationDate': null,
        'fileUrl': '/sites/default/files/2017-09/5000-4021.pdf',
        'version': '1'
      }
    ],
    'officeLink': {
      'url': '/offices/headquarters/oca',
      'title': 'Office of Capital Access'
    },
    'ombNumber': {},
    'programs': [
      'paging program'
    ],
    'summary': 'A summary',
    'type': 'document',
    'title': 'Page of a Document',
    'id': 1115,
    'updated': 1512075693,
    'created': 1504815259,
    'langCode': 'en',
    'url': '/document/some-doc'
  },
  {
    'activitys': [
      'paging activity'
    ],
    'documentIdNumber': '5000-4021',
    'documentIdType': 'full type',
    'files': [
      {
        'id': 1116,
        'type': 'docFile',
        'effectiveDate': '2017-08-28',
        'expirationDate': null,
        'fileUrl': '/sites/default/files/2017-09/5000-4021.pdf',
        'version': '1'
      }
    ],
    'officeLink': {
      'url': '/offices/headquarters/oca',
      'title': 'Office of Capital Access'
    },
    'ombNumber': {},
    'programs': [
      'paging program'
    ],
    'summary': 'A summary',
    'type': 'document',
    'title': 'Page of a Document',
    'id': 1116,
    'updated': 1512075693,
    'created': 1504815259,
    'langCode': 'en',
    'url': '/document/some-doc'
  },
  {
    'activitys': [
      'paging activity'
    ],
    'documentIdNumber': '5000-4021',
    'documentIdType': 'full type',
    'files': [
      {
        'id': 1117,
        'type': 'docFile',
        'effectiveDate': '2017-08-28',
        'expirationDate': null,
        'fileUrl': '/sites/default/files/2017-09/5000-4021.pdf',
        'version': '1'
      }
    ],
    'officeLink': {
      'url': '/offices/headquarters/oca',
      'title': 'Office of Capital Access'
    },
    'ombNumber': {},
    'programs': [
      'paging program'
    ],
    'summary': 'A summary',
    'type': 'document',
    'title': 'Page of a Document',
    'id': 1117,
    'updated': 1512075693,
    'created': 1504815259,
    'langCode': 'en',
    'url': '/document/some-doc'
  },
  {
    'activitys': [
      'paging activity'
    ],
    'documentIdNumber': '5000-4021',
    'documentIdType': 'full type',
    'files': [
      {
        'id': 1118,
        'type': 'docFile',
        'effectiveDate': '2017-08-28',
        'expirationDate': null,
        'fileUrl': '/sites/default/files/2017-09/5000-4021.pdf',
        'version': '1'
      }
    ],
    'officeLink': {
      'url': '/offices/headquarters/oca',
      'title': 'Office of Capital Access'
    },
    'ombNumber': {},
    'programs': [
      'paging program'
    ],
    'summary': 'A summary',
    'type': 'document',
    'title': 'Page of a Document',
    'id': 1118,
    'updated': 1512075693,
    'created': 1504815259,
    'langCode': 'en',
    'url': '/document/some-doc'
  }
]

module.exports.testDocs = testDocs
module.exports.sortedDocs = sortedDocs
module.exports.documents = documents
