const config = require('../config')
// const s3CacheReader = require('../clients/s3-cache-reader.js')
// const searchUtils = require('./search-utils.js')
const cloudsearch = require('../clients/cloudsearch.js')

// const { isEmpty, orderBy } = require('lodash')

const endpoint = config.cloudSearch.articleEndpoint

async function fetchArticles (queryParams) {
  let cloudParams = {
    query: buildQuery(queryParams.searchTerm), /* required */
    filterQuery: buildFilters(queryParams),
    queryParser: 'structured',
    size: queryParams.pageSize,
    start: queryParams.start,
    sort: setArticleSearchSort(queryParams.sortBy),
    return: '_all_fields'
  }
  const result = await cloudsearch.runSearch(cloudParams, endpoint)
  const hits = result.hits
  return Object.assign({}, hits)
}

function buildQuery (query) {
  const queryStatements = []
  let queryString = ''
  // const fieldsToSearch = ['title', 'article_body', 'summary', 'url']
  const fieldsToSearch = ['region', 'related_offices']
  for (const field of fieldsToSearch) {
    queryStatements.push(`${field}: '${cloudsearch.formatString(query)}'`)
  }
  if (queryStatements.length > 1) {
    queryString = `(or ${queryStatements.join(' ')})`
  }
  return queryString
}

function buildFilters (params) {
  let filterString = null
  let filters = []

  if (params.articleCategory && params.articleCategory === 'all') {
    filters.push(`article_category: '${cloudsearch.formatString(params.articleCategory)}'`)
  }
  if (params.program && params.program === 'all') {
    filters.push(`article_programs: '${cloudsearch.formatString(params.program)}'`)
  }
  if (params.office && params.office === 'all') {
    filters.push(`related_offices: '${cloudsearch.formatString(params.program)}'`)
  }
  // if (params.region && params.region === 'all') {
  filters.push(`region: '${cloudsearch.formatString(params.region)} National'`)
  // }

  if (filters.length === 1) {
    filterString = filters[0]
  } else if (filters.length > 1) {
    filterString = `(and ${filters.join(' ')})`
  }
  return filterString
}

function setArticleSearchSort (sortParm) {
  let sortString = 'created desc'

  if (sortParm && sortParm === 'Title') {
    sortString = 'title desc'
  } else if (sortParm && sortParm === 'Authored on Date') {
    sortString = 'created desc'
  } else if (sortParm && sortParm === 'Last Updated') {
    sortString = 'updated desc'
  }
  return sortString
}

module.exports.fetchArticles = fetchArticles
