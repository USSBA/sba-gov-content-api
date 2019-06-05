const s3CacheReader = require('../clients/s3-cache-reader.js')
const searchUtils = require('./search-utils.js')

const { isEmpty, orderBy } = require('lodash')

function fetchArticles (queryParams) {
  let sortField = 'updated'
  let sortOrder = 'desc'

  if (queryParams) {
    const { sortBy } = queryParams

    if (sortBy === 'Title') {
      sortField = 'title'
      sortOrder = 'asc'
    } else if (sortBy === 'Authored on Date') {
      sortField = 'created'
    }
  }

  return s3CacheReader.getKey('articles')
    .then(result => orderBy(result, sortField, sortOrder))
    .then(result => {
      let items = result
      let count = items.length

      if (queryParams) {
        items = filterArticles(queryParams, result)
        count = items.length

        const { end, start } = queryParams
        items = searchUtils.paginateSearch(items, start, end)
      }

      return {
        items,
        count
      }
    })
}

function filterArticles (params, allArticles) {
  return allArticles.filter((article, index) => {
    const matchesUrl = !params.url || params.url === 'all' || article.url === params.url
    const matchesCategory = !params.articleCategory ||
      params.articleCategory === 'all' ||
      (!isEmpty(article.category) && article.category.includes(params.articleCategory))
    const matchesProgram = !params.program ||
      params.program === 'all' ||
      (!isEmpty(article.programs) && article.programs.includes(params.program))
    const matchesTitle = !params.searchTerm ||
      params.searchTerm === 'all' ||
      article.title.toLowerCase().includes(params.searchTerm.toLowerCase())
    const matchesType = !params.articleType || params.articleType === 'all' || article.type === params.articleType
    return matchesUrl && matchesCategory && matchesProgram && matchesTitle && matchesType
  })
}

module.exports.fetchArticles = fetchArticles
