/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()

const documentSearch = require('./document-search')
const cloudsearch = require('../clients/cloudsearch')

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
      const params = {
        'searchTerm': 'test'
      }
      const expected = "(or title: 'test' summary: 'test' url: 'test')"
      const result = documentSearch.buildQuery(params.searchTerm)
      result.should.eql(expected)
    })
  })

  describe('buildFilters', () => {
    it('should format filter string for cloudsearch() when multiple params are passed in', () => {
      const params = {
        'documentType': 'Information notice',
        'documentActivity': 'Processing',
        'program': 'PPP',
        'office': '3948'
      }
      const expected = "(and office: '3948' document_programs: 'PPP' document_type: 'Information notice' document_activitys: 'Processing')"
      const result = documentSearch.buildFilters(params)
      result.should.eql(expected)
    })

    it('should format filter string for cloudsearch() when only "documentType" is passed in', () => {
      const params = {
        'documentType': 'Information notice'
      }
      const expected = "(and document_type: 'Information notice')"
      const result = documentSearch.buildFilters(params)
      result.should.eql(expected)
    })

    it('should format filter string for cloudsearch() when only "documentActivity" is passed in', () => {
      const params = {
        'documentActivity': 'Processing'
      }
      const expected = "(and document_activitys: 'Processing')"
      const result = documentSearch.buildFilters(params)
      result.should.eql(expected)
    })

    it('should format filter string for cloudsearch() when only "program" is passed in', () => {
      const params = {
        'program': 'PPP'
      }
      const expected = "(and document_programs: 'PPP')"
      const result = documentSearch.buildFilters(params)
      result.should.eql(expected)
    })

    it('should format filter string for cloudsearch() when only "office" is passed in', () => {
      const params = {
        'office': '3948'
      }
      const expected = "(and office: '3948')"
      const result = documentSearch.buildFilters(params)
      result.should.eql(expected)
    })

    it('should return empty filter string for cloudsearch() when no params are passed in', () => {
      const params = {}
      const expected = ''
      const result = documentSearch.buildFilters(params)
      result.should.eql(expected)
    })
  })

  describe('setDocumentSearchSort', () => {
    it('should set the default sort and order of "updated desc" when no "sortBy" and no "order" query parameter is passed in', () => {
      const params = {}
      const expected = 'updated desc'
      const result = documentSearch.setDocumentSearchSort(params)
      result.should.eql(expected)
    })

    it('should set the sort to use "title" when "Title" is passed in', () => {
      const params = {
        'sortBy': 'Title'
      }
      const expected = 'title desc'
      const result = documentSearch.setDocumentSearchSort(params)
      result.should.eql(expected)
    })

    it('should set the sort to use "document_id" when "Number" is passed in', () => {
      const params = {
        'sortBy': 'Number'
      }
      const expected = 'document_id desc'
      const result = documentSearch.setDocumentSearchSort(params)
      result.should.eql(expected)
    })

    it('should set the sort to use "latest_file_effective_date" when "Effective Date" is passed in', () => {
      const params = {
        'sortBy': 'Effective Date'
      }
      const expected = 'latest_file_effective_date desc'
      const result = documentSearch.setDocumentSearchSort(params)
      result.should.eql(expected)
    })

    it('should set the sort to order by "asc" when "asc" is passed in', () => {
      const params = {
        'order': 'asc'
      }
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

  describe('getFilesDataIfPresent', () => {
    it('should reformat the file data when both "docFile" and "latestFileEffectiveDate" exist', () => {
      const docFile = ['/file/url']
      const latestFileEffectiveDate = ['2017-08-28T00:00:00']
      const fileData = documentSearch.getFilesDataIfPresent(docFile, latestFileEffectiveDate)

      const expected = [
        {
          effectiveDate: '2017-08-28',
          fileUrl: '/file/url'
        }
      ]
      fileData.should.eql(expected)
    })

    it('should reformat the file data when only "docFile" exists', () => {
      const docFile = ['/file/url']
      const latestFileEffectiveDate = undefined
      const fileData = documentSearch.getFilesDataIfPresent(docFile, latestFileEffectiveDate)

      const expected = [
        {
          fileUrl: '/file/url'
        }
      ]
      fileData.should.eql(expected)
    })

    it('should reformat the file data when only "latestFileEffectiveDate" exists', () => {
      const docFile = undefined
      const latestFileEffectiveDate = ['2017-08-28T00:00:00']
      const fileData = documentSearch.getFilesDataIfPresent(docFile, latestFileEffectiveDate)

      const expected = [
        {
          effectiveDate: '2017-08-28'
        }
      ]
      fileData.should.eql(expected)
    })

    it('should return an empty array when both "docFile" and "latestFileEffectiveDate" are undefined', () => {
      const docFile = undefined
      const latestFileEffectiveDate = undefined
      const fileData = documentSearch.getFilesDataIfPresent(docFile, latestFileEffectiveDate)

      const expected = []
      fileData.should.eql(expected)
    })
  })
})
