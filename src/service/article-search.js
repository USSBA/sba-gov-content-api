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
  let filterString = null
  let filters = []

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

  if (params.articleCategory && params.articleCategory !== 'all') {
    filterString = `(and article_category: '${cloudsearch.formatString(params.articleCategory)}' ${filterString})`
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
    sort: setArticleSearchSort(queryParams.sortBy),
    return: '_all_fields'
  }
  const result = await cloudsearch.runSearch(cloudParams, endpoint)
  const { end, start } = queryParams
  const hits = searchUtils.paginateSearch(result.hit, start, end)
  return Object.assign({}, {
    items: hits,
    count: hits.length
  })
}

module.exports.fetchArticles = fetchArticles
