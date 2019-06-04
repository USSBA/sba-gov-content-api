const s3CacheReader = require('../clients/s3-cache-reader.js')
const searchUtils = require('./search-utils.js')

const { orderBy } = require('lodash')

function fetchArticles (queryParams) {
  let sortField = 'updated'
  let sortOrder = 'desc'

  if (queryParams) {
    const { sortBy } = queryParams

    if (sortBy === 'Title') {
      sortField = 'title'
      sortOrder = 'asc'
    // } else if (sortBy == 'Last Updated') {
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
        // if (!(start === 'all' || end === 'all')) {
        //   items = items.slice(start, end)
        // }
        items = searchUtils.paginateSearch(items, start, end)
      }

      return {
        items,
        count
      }
    })
}

module.exports.fetchArticles = fetchArticles