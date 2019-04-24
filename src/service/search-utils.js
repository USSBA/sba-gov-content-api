function paginateSearch (searchResults, start = 'all', end = 'all') {
  let resultsCount = searchResults.length
  let resultsStart = (start === 'all') ? 0 : start
  let resultsEnd = (end === 'all') ? searchResults.length : end

  return searchResults.slice(resultsStart, resultsEnd)
}

module.exports.paginateSearch = paginateSearch
