const config = require('../config')
const s3CacheReader = require('../clients/s3-cache-reader.js')
const searchUtils = require('./search-utils.js')
const cloudsearch = require('../clients/cloudsearch.js')

const { isEmpty, orderBy } = require('lodash')

const endpoint = config.cloudSearch.articleEndpoint

async function fetchArticles (queryParams){
  let cloudParams = {
    query: buildQuery(queryParams.searchTerm), /* required */
    filterQuery: buildFilters(queryParams),
    queryParser: 'structured',
    size: pageSize,
    start: start,
    sort: setArticleSearchSort(queryParams.sortBy),
    return: '_all_fields'
  }
  const result =  await cloudsearch.runSearch(cloudParams, endpoint)
  const hits = result.hits
  const newHitList = hits.hit.map(item => {
    let _item = item
    if (item && item.exprs && item.exprs.distance >= 0) {
      if (!address) {
        _item = Object.assign({}, item)
        delete _item.exprs
      } else {
        _item = Object.assign({}, item, { exprs: { distance: item.exprs.distance / location.kilometersPerMile } })
      }
    }
    return _item
  })
  return Object.assign({}, hits, { hit: newHitList })
}

function buildQuery (query) {
  const queryStatements = []
  let queryString = ''
  const fieldsToSearch = ['title', 'body', 'summary', 'url']
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

  if (filters.length === 1) {
    filterString = filters[0]
  } else if (filters.length > 1) {
    filterString = `(and ${filters.join(' ')})`
  }
  return filterString
}

function setArticleSearchSort(sortParm){
  let sortString = 'created desc'

  if (sortParm && sortParm === 'Title'){
    sortString = 'title desc'
  } else if (sortParm && sortParm === 'Authored on Date'){
    sortString = 'created desc'
  } else if (sortParm && sortParm === 'Last Updated') {
    sortString = 'updated desc'
  }
  return sortString
}

// function fetchArticles (queryParams) {
//   let sortField = 'updated'
//   let sortOrder = 'desc'

//   if (queryParams) {
//     const { sortBy } = queryParams

//     if (sortBy === 'Title') {
//       sortField = 'title'
//       sortOrder = 'asc'
//     } else if (sortBy === 'Authored on Date') {
//       sortField = 'created'
//     }
//   }

//   return s3CacheReader.getKey('articles')
//     .then(result => orderBy(result, sortField, sortOrder))
//     .then(result => {
//       let items = result
//       let count = items.length

//       if (queryParams) {
//         items = filterArticles(queryParams, result)
//         count = items.length

//         const { end, start } = queryParams
//         items = searchUtils.paginateSearch(items, start, end)
//       }

//       return {
//         items,
//         count
//       }
//     })
// }

// function filterArticles (params, allArticles) {
//   return allArticles.filter((article, index) => {
//     const matchesUrl = !params.url || params.url === 'all' || article.url === params.url
//     const matchesCategory = !params.articleCategory ||
//       params.articleCategory === 'all' ||
//       (!isEmpty(article.category) && article.category.includes(params.articleCategory))
//     const matchesProgram = !params.program ||
//       params.program === 'all' ||
//       (!isEmpty(article.programs) && article.programs.includes(params.program))
//     const matchesTitle = !params.searchTerm ||
//       params.searchTerm === 'all' ||
//       article.title.toLowerCase().includes(params.searchTerm.toLowerCase())
//     const matchesType = !params.articleType || params.articleType === 'all' || article.type === params.articleType
//     const matchesOffice = !params.office || params.office === 'all' || article.office === Number(params.office)
//     return matchesUrl && matchesCategory && matchesProgram && matchesTitle && matchesType && matchesOffice
//   })
// }

module.exports.fetchArticles = fetchArticles
