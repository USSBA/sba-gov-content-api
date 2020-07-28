/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()

const documentSearch = require('./document-search')
const cloudsearch = require('../clients/cloudsearch')

const defaultQueryParams = {
  'searchTerm': 'test',
  'documentType': 'Information notice',
  'documentActivity': 'Processing',
  'program': 'PPP',
  'office': '3948',
  'start': '0',
  'end': '3'
}

describe('documentSearch', () => {
  let stubRunSearch, spyBuildQuery, spyBuildFilters, spySetDocumentSearchSort
  before(() => {
    stubRunSearch = sinon.stub(cloudsearch, 'runSearch')
    spyBuildQuery = sinon.spy(documentSearch, 'buildQuery')
    spyBuildFilters = sinon.spy(documentSearch, 'buildFilters')
    spySetDocumentSearchSort = sinon.spy(documentSearch, 'setDocumentSearchSort')
  })
  afterEach(() => {
    stubRunSearch.reset()
  })
  after(() => {
    stubRunSearch.restore()
    spyBuildQuery.restore()
    spyBuildFilters.restore()
    spySetDocumentSearchSort.restore()
  })

  describe('fetchDocuments', () => {
    it('should invoke runSearch()', async () => {
      stubRunSearch.returns({
        'status': {
          'timems': 2,
          'rid': 'uMeq1fotJwq2RTs='
        },
        'hits': {
          'found': 0,
          'start': 0,
          'hit': []
        }
      })

      await documentSearch.fetchDocuments({})
      stubRunSearch.called.should.be.true
    })

    it('should remap results from "hit" to "items" and from "found" to "count"', async () => {
      stubRunSearch.returns({
        'status': {
          'timems': 2,
          'rid': 'uMeq1fotJwq2RTs='
        },
        'hits': {
          'found': 0,
          'start': 0,
          'hit': []
        }
      })
      const expected = {
        items: [],
        count: 0
      }

      const result = await documentSearch.fetchDocuments({})
      result.should.eql(expected)
    })
  })

  describe('buildQuery', () => {
    it('should format query string for cloudSearch()', () => {
      const params = Object.assign({}, defaultQueryParams)
      const expected = "(or title: 'test' summary: 'test' url: 'test')"
      const result = documentSearch.buildQuery(params.searchTerm)
      result.should.eql(expected)
    })
  })

  describe('buildFilters', () => {
    it('should format filter string for cloudsearch()', () => {
      const params = Object.assign({}, defaultQueryParams)
      const expected = "(and office: '3948' document_programs: 'PPP' document_type: 'Information notice' document_activitys: 'Processing')"
      const result = documentSearch.buildFilters(params)
      result.should.eql(expected)
    })
  })

  describe('setDocumentSearchSort', () => {
    it('should set the default sort and order of "updated desc" when no "sortBy" and no "order" query parameter is passed in', () => {
      const params = Object.assign({}, defaultQueryParams)
      const expected = 'updated desc'
      const result = documentSearch.setDocumentSearchSort(params)
      result.should.eql(expected)
    })

    it('should set the sort to use "title" when "Title" is passed in', () => {
      const params = Object.assign({}, defaultQueryParams, {
        'sortBy': 'Title'
      })
      const expected = 'title desc'
      const result = documentSearch.setDocumentSearchSort(params)
      result.should.eql(expected)
    })

    it('should set the sort to use "document_id" when "Number" is passed in', () => {
      const params = Object.assign({}, defaultQueryParams, {
        'sortBy': 'Number'
      })
      const expected = 'document_id desc'
      const result = documentSearch.setDocumentSearchSort(params)
      result.should.eql(expected)
    })

    it('should set the sort to use "latest_file_effective_date" when "Effective Date" is passed in', () => {
      const params = Object.assign({}, defaultQueryParams, {
        'sortBy': 'Effective Date'
      })
      const expected = 'latest_file_effective_date desc'
      const result = documentSearch.setDocumentSearchSort(params)
      result.should.eql(expected)
    })

    it('should set the sort to order by "asc" when "asc" is passed in', () => {
      const params = Object.assign({}, defaultQueryParams, {
        'order': 'asc'
      })
      const expected = 'updated asc'
      const result = documentSearch.setDocumentSearchSort(params)
      result.should.eql(expected)
    })
  })

  describe('transformToDaishoDocumentObjectFormat', () => {
    it('should remap an object when all fields are present', () => {
      const items = [
        {
          id: '20351',
          fields: {
            document_activitys: ['Processing'],
            document_programs: ['PPP'],
            document_id: ['5000-4021'],
            document_type: ['Policy notice'],
            office: ['6422'],
            doc_file: ['/folder/myFile.pdf'],
            latest_file_effective_date: ['2017-08-28T00:00:00Z'],
            remove_download_button: ['1'],
            summary: ['summary text'],
            title: ['My First Document'],
            created: ['1574192414'],
            updated: ['1574192835'],
            url: ['/document/myFirstDocument']
          }
        }
      ]

      const expected = [
        {
          id: 20351,
          activitys: ['Processing'],
          documentIdNumber: '5000-4021',
          documentIdType: 'Policy notice',
          files: [
            {
              effectiveDate: '2017-08-28',
              fileUrl: '/folder/myFile.pdf'
            }
          ],
          office: 6422,
          programs: ['PPP'],
          removeDownloadButton: true,
          summary: 'summary text',
          title: 'My First Document',
          type: 'document',
          created: 1574192414,
          updated: 1574192835,
          url: '/document/myFirstDocument'
        }
      ]
      const result = documentSearch.transformToDaishoDocumentObjectFormat(items)
      result.should.eql(expected)
    })

    it('should remap an object with default values when any field is NOT present', () => {
      const items = [
        {
          id: '20351',
          fields: {}
        }
      ]

      const expected = [
        {
          id: 20351,
          activitys: {},
          documentIdNumber: {},
          documentIdType: '',
          files: [],
          office: {},
          programs: [],
          removeDownloadButton: {},
          summary: '',
          title: '',
          type: 'document',
          created: {},
          updated: {},
          url: ''
        }
      ]

      const result = documentSearch.transformToDaishoDocumentObjectFormat(items)
      result.should.eql(expected)
    })

    it('should remap an object with stringified numbers converted to numbers for certain fields', () => {
      const items = [
        {
          id: '20351',
          fields: {
            office: ['6422'],
            created: ['1574192414'],
            updated: ['1574192835']
          }
        }
      ]

      const expected = [
        {
          id: 20351,
          activitys: {},
          documentIdNumber: {},
          documentIdType: '',
          files: [],
          office: 6422,
          programs: [],
          removeDownloadButton: {},
          summary: '',
          title: '',
          type: 'document',
          created: 1574192414,
          updated: 1574192835,
          url: ''
        }
      ]

      const result = documentSearch.transformToDaishoDocumentObjectFormat(items)
      result.should.eql(expected)
    })

    it('should remap an object while preserving arrays for certain fields', () => {
      const items = [
        {
          id: '20351',
          fields: {
            document_activitys: ['Processing', 'Notice'],
            document_programs: ['PPP', 'Pandemic News']
          }
        }
      ]

      const expected = [
        {
          id: 20351,
          activitys: ['Processing', 'Notice'],
          documentIdNumber: {},
          documentIdType: '',
          files: [],
          office: {},
          programs: ['PPP', 'Pandemic News'],
          removeDownloadButton: {},
          summary: '',
          title: '',
          type: 'document',
          created: {},
          updated: {},
          url: ''
        }
      ]

      const result = documentSearch.transformToDaishoDocumentObjectFormat(items)
      result.should.eql(expected)
    })

    it('should remap removeDownloadButton value to true when remove_download_button is 1', () => {
      const items = [
        {
          id: '20351',
          fields: {
            remove_download_button: ['1']
          }
        }
      ]

      const expected = [
        {
          id: 20351,
          activitys: {},
          documentIdNumber: {},
          documentIdType: '',
          files: [],
          office: {},
          programs: [],
          removeDownloadButton: true,
          summary: '',
          title: '',
          type: 'document',
          created: {},
          updated: {},
          url: ''
        }
      ]

      const result = documentSearch.transformToDaishoDocumentObjectFormat(items)
      result.should.eql(expected)
    })

    it('should remap removeDownloadButton value to false when remove_download_button is 0', () => {
      const items = [
        {
          id: '20351',
          fields: {
            remove_download_button: ['0']
          }
        }
      ]

      const expected = [
        {
          id: 20351,
          activitys: {},
          documentIdNumber: {},
          documentIdType: '',
          files: [],
          office: {},
          programs: [],
          removeDownloadButton: false,
          summary: '',
          title: '',
          type: 'document',
          created: {},
          updated: {},
          url: ''
        }
      ]

      const result = documentSearch.transformToDaishoDocumentObjectFormat(items)
      result.should.eql(expected)
    })
  })
})
