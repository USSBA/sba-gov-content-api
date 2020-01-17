const cloudsearch = require('../clients/cloudsearch.js')
const searchUtils = require('./search-utils.js')
const config = require('../config')
const endpoint = config.cloudSearch.articleEndpoint

function ArticleSearch () {
  this.buildQuery = function (query) {
    const queryStatements = []
    let queryString = ''
    const fieldsToSearch = ['title', 'article_body', 'summary', 'url']
    for (const field of fieldsToSearch) {
      queryStatements.push(`${field}: '${cloudsearch.formatString(query)}'`)
    }
    if (queryStatements.length > 1) {
      queryString = `(or ${queryStatements.join(' ')})`
    }

    return queryString
  }

  this.buildFilters = function (params) {
    let officeFilters = []
    let officeFilterString
    let programFilterString
    let categoryFilterString
    let filters = []
    let filterString = ''

    if (params.relatedOffice && !isNaN(Number(params.relatedOffice))) {
      officeFilters.push(`(or related_offices: '${params.relatedOffice}')`)
    }
    if (params.relatedOffice && !isNaN(Number(params.office))) {
      officeFilters.push(`(or office: '${params.office}')`)
    }
    if (params.region) {
      officeFilters.push(`(or region: '${cloudsearch.formatString(params.region)}')`)
    }
    if (params.national && params.national === 'true') {
      officeFilters.push(`(or region: 'National')`)
    }

    if (officeFilters.length === 1) {
      officeFilterString = officeFilters[0]
    } else if (officeFilters.length > 1) {
      officeFilterString = officeFilters.join(' ')
    }

    if (params.program && params.program !== 'all') {
      programFilterString = `article_programs: '${cloudsearch.formatString(params.program)}'`
    }

    if (params.articleCategory && params.articleCategory !== 'all') {
      categoryFilterString = `article_category: '${cloudsearch.formatString(params.articleCategory)}'`
    }

    programFilterString && filters.push(programFilterString)
    categoryFilterString && filters.push(categoryFilterString)
    filterString += `(and ${officeFilterString} ${filters.join(' ')})`

    return filterString
  }

  this.setArticleSearchSort = function (params) {
    let sortField = 'updated'
    let sortOrder = 'desc'

    if (params.sortBy) {
      if (params.sortBy === 'Title') {
        sortField = 'title'
      }
      if (params.sortBy === 'Authored on Date') {
        sortField = 'created'
      }
    }

    if (params.order && params.order === 'asc') {
      sortOrder = 'asc'
    }

    const result = `${sortField} ${sortOrder}`
    return result
  }

  this.fetchArticles = async function (queryParams) {
    const query = queryParams.searchTerm ? this.buildQuery(queryParams.searchTerm) : 'matchall'
    let cloudParams = {
      query: query, /* required */
      filterQuery: this.buildFilters(queryParams),
      queryParser: 'structured',
      sort: this.setArticleSearchSort(queryParams),
      return: '_all_fields'
    }
    const result = await cloudsearch.runSearch(cloudParams, endpoint)
    const { end, start } = queryParams
    const hits = searchUtils.paginateSearch(result.hits.hit, start, end)
    return Object.assign({}, {
      items: hits,
      count: hits.length
    })
  }

  return {
    buildQuery: this.buildQuery,
    buildFilters: this.buildFilters,
    setArticleSearchSort: this.setArticleSearchSort,
    fetchArticles: this.fetchArticles
  }
}

module.exports = ArticleSearch()
