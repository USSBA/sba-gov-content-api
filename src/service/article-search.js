const config = require('../config')
// const s3CacheReader = require('../clients/s3-cache-reader.js')
// const searchUtils = require('./search-utils.js')
const cloudsearch = require('../clients/cloudsearch.js')

// const { isEmpty, orderBy } = require('lodash')

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
  let filterString = null
  let filters = []

  if (params.articleCategory && params.articleCategory !== 'all') {
    filters.push(`article_category: '${cloudsearch.formatString(params.articleCategory)}'`)
  }
  if (params.relatedOffice && !isNaN(Number(params.relatedOffice))) {
    filters.push(`related_offices: '${params.relatedOffice}'`)
  }
  if (params.region) {
    filters.push(`region: '${cloudsearch.formatString(params.region)}'`)
  }
  if (params.national && params.national === 'true') {
    filters.push(`region: 'National'`)
  }

  if (filters.length === 1) {
    filterString = filters[0]
  } else if (filters.length > 1) {
    filterString = `(or ${filters.join(' ')})`
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

async function fetchArticles (queryParams) {
  const query = queryParams.searchTerm ? buildQuery(queryParams.searchTerm) : 'matchall'
  let cloudParams = {
    query: query, /* required */
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

module.exports.fetchArticles = fetchArticles
