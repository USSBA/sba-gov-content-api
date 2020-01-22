/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()

const articleSearch = require('./article-search')
const cloudsearch = require('../clients/cloudsearch')

const defaultQueryParams = {
  'searchTerm': 'test',
  'articleCategory': 'Press release',
  'end': '3',
  'mode': 'districtOffice',
  'national': 'true',
  'office': '3948',
  'relatedOffice': '6386',
  'start': '0',
  'region': 'Region IV',
  'program': 'SBIC'
}

describe('articleSearch', () => {
  let stubRunSearch, spyBuildQuery, spyBuildFilters, spySetArticleSearchSort
  before(() => {
    stubRunSearch = sinon.stub(cloudsearch, 'runSearch')
    spyBuildQuery = sinon.spy(articleSearch, 'buildQuery')
    spyBuildFilters = sinon.spy(articleSearch, 'buildFilters')
    spySetArticleSearchSort = sinon.spy(articleSearch, 'setArticleSearchSort')
  })
  afterEach(() => {
    stubRunSearch.reset()
  })
  after(() => {
    stubRunSearch.restore()
    spyBuildQuery.restore()
    spyBuildFilters.restore()
    spySetArticleSearchSort.restore()
  })
  describe('fetchArticles', () => {
    it('should invoke buildQuery()', async () => {
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

      const params = Object.assign({}, defaultQueryParams)
      await articleSearch.fetchArticles(params)
      spyBuildQuery.called.should.be.true
    })
    it('should invoke buildFilters()', async () => {
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

      const params = Object.assign({}, defaultQueryParams)
      await articleSearch.fetchArticles(params)
      spyBuildFilters.called.should.be.true
    })
    it('should invoke setArticleSearchSort()', async () => {
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
      const params = Object.assign({}, defaultQueryParams)
      await articleSearch.fetchArticles(params)
      spySetArticleSearchSort.called.should.be.true
    })
  })
  describe('buildQuery', () => {
    it('should format query string for cloudSearch()', () => {
      const params = Object.assign({}, defaultQueryParams)
      const expected = "(or title: 'test' article_body: 'test' summary: 'test' url: 'test')"
      const result = articleSearch.buildQuery(params.searchTerm)
      result.should.eql(expected)
    })
  })
  describe('buildFilters', () => {
    it('should format filter string for cloudsearch()', () => {
      const params = Object.assign({}, defaultQueryParams)
      const expected = "(and (or related_offices: '6386' office: '3948' region: 'Region IV' region: 'National') article_programs: 'SBIC' article_category: 'Press release')"
      const result = articleSearch.buildFilters(params)
      result.should.eql(expected)
    })
  })
  describe('setArticleSearchSort', () => {
    it('should set article search sort to "update desc" as default', () => {
      const params = Object.assign({}, defaultQueryParams)
      const expected = 'updated desc'
      const result = articleSearch.setArticleSearchSort(params)
      result.should.eql(expected)
    })
    it('should set article search sort to "created desc"', () => {
      const params = Object.assign({}, defaultQueryParams, {
        'sortBy': 'Authored on Date'
      })
      const expected = 'created desc'
      const result = articleSearch.setArticleSearchSort(params)
      result.should.eql(expected)
    })
    it('should set article search sort to "title asc"', () => {
      const params = Object.assign({}, defaultQueryParams, {
        'sortBy': 'Title',
        'order': 'asc'
      })
      const expected = 'title asc'
      const result = articleSearch.setArticleSearchSort(params)
      result.should.eql(expected)
    })
  })
  describe('transformToDaishoArticleObjectFormat', () => {
    it('should remap an object when all fields are present', () => {
      const items = [
        {
          id: '20351',
          fields: {
            article_category: ['Press release'],
            office: ['6422'],
            article_programs: ['7(a)'],
            region: ['National (all regions)'],
            related_offices: ['17054'],
            summary: ['summary text'],
            title: ['CST Article 2 (single input fields)'],
            created: ['1574192414'],
            updated: ['1574192835'],
            url: ['/article/2019/nov/19/cst-article-2-single-input-fields']
          }
        }
      ]

      const expected = [
        {
          id: 20351,
          category: ['Press release'],
          office: 6422,
          programs: ['7(a)'],
          region: ['National (all regions)'],
          relatedOffices: [17054],
          summary: 'summary text',
          type: 'article',
          title: 'CST Article 2 (single input fields)',
          created: 1574192414,
          updated: 1574192835,
          url: '/article/2019/nov/19/cst-article-2-single-input-fields'
        }
      ]
      const result = articleSearch.transformToDaishoArticleObjectFormat(items)
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
          category: [],
          office: {},
          programs: [],
          region: [],
          relatedOffices: [],
          summary: '',
          type: 'article',
          title: '',
          created: {},
          updated: {},
          url: ''
        }
      ]

      const result = articleSearch.transformToDaishoArticleObjectFormat(items)
      result.should.eql(expected)
    })

    it('should remap an object with stringified numbers converted to numbers for certain fields', () => {
      const items = [
        {
          id: '20351',
          fields: {
            office: ['6422'],
            related_offices: ['17054', '23566'],
            created: ['1574192414'],
            updated: ['1574192835']
          }
        }
      ]

      const expected = [
        {
          id: 20351,
          category: [],
          office: 6422,
          programs: [],
          region: [],
          relatedOffices: [17054, 23566],
          summary: '',
          type: 'article',
          title: '',
          created: 1574192414,
          updated: 1574192835,
          url: ''
        }
      ]

      const result = articleSearch.transformToDaishoArticleObjectFormat(items)
      result.should.eql(expected)
    })

    it('should remap an object while preserving arrays for certain fields', () => {
      const items = [
        {
          id: '20351',
          fields: {
            article_category: ['Notice', 'Press release'],
            article_programs: ['7(a)', '8(a)'],
            region: ['Region I', 'Region V'],
            related_offices: ['17054', '23566']
          }
        }
      ]

      const expected = [
        {
          id: 20351,
          category: ['Notice', 'Press release'],
          office: {},
          programs: ['7(a)', '8(a)'],
          region: ['Region I', 'Region V'],
          relatedOffices: [17054, 23566],
          summary: '',
          type: 'article',
          title: '',
          created: {},
          updated: {},
          url: ''
        }
      ]

      const result = articleSearch.transformToDaishoArticleObjectFormat(items)
      result.should.eql(expected)
    })
  })
})
