function paginateSearch(results, start = 'all', end = 'all') {
  let resultsStart = (start === 'all') ? 0 : start
  let resultsEnd = (end === 'end') ? results.length : end

  return blogs.slice(resultsStart, resultsEnd)
}

module.exports.paginateSearch = paginateSearch
