const cloudsearch = require('../clients/cloudsearch.js')
const searchUtils = require('./search-utils.js')
const config = require('../config')
const endpoint = config.cloudSearch.articleEndpoint

function buildQuery (query) {
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

function buildFilters (params) {
  let officeFilters = []
  let officeFilterString
  let programFilterString
  let categoryFilterString
  let filters = []
  let filterString = null

  if (params.relatedOffice && !isNaN(Number(params.relatedOffice))) {
    officeFilters.push(`(related_offices: '${params.relatedOffice}')`)
    officeFilters.push(`(offices: '${params.office}')`)
  }
  if (params.region) {
    officeFilters.push(`(region: '${cloudsearch.formatString(params.region)}')`)
  }
  if (params.national && params.national === 'true') {
    officeFilters.push(`(region: 'National')`)
  }

  if (officeFilters.length === 1) {
    officeFilterString = officeFilters[0]
  } else if (officeFilters.length > 1) {
    officeFilterString = `(or ${officeFilters.join(' ')})`
  }

  if (params.program && params.program !== 'all') {
    programFilterString = `(article_programs: '${cloudsearch.formatString(params.program)}')`
  }

  if (params.articleCategory && params.articleCategory !== 'all') {
    categoryFilterString = `(article_category: '${cloudsearch.formatString(params.articleCategory)}')`
  }

  officeFilterString && filters.push(officeFilterString)
  programFilterString && filters.push(programFilterString)
  categoryFilterString && filters.push(categoryFilterString)

  if (filters.length === 1) {
    filterString = filters[0]
  } else if (filters.length > 1) {
    filterString = `(and ${filters.join(' ')})`
  }

  return filterString
}

function setArticleSearchSort (params) {
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
    sortField = 'asc'
  }

  return `${sortField} ${sortOrder}`
}

async function fetchArticles (queryParams) {
  const query = queryParams.searchTerm ? buildQuery(queryParams.searchTerm) : 'matchall'
  let cloudParams = {
    query: query, /* required */
    filterQuery: buildFilters(queryParams),
    queryParser: 'structured',
    sort: setArticleSearchSort(queryParams),
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

module.exports.fetchArticles = fetchArticles
