function paginateSearch(results, start = 'all', end = 'all') {
  let resultsStart = (start === 'all') ? 0 : start
  let resultsEnd = (end === 'all') ? results.length : end

  return results.slice(resultsStart, resultsEnd)
}

module.exports.paginateSearch = paginateSearch
