const config = require('../config')
const cloudsearch = require('../clients/cloudsearch.js')
const location = require('./location.js')

const endpoint = config.cloudSearch.lenderEndpoint
// the default geocode is located in Washington, DC 20001
const defaultGeocode = {
  latitude: 38.893311,
  longitude: -77.014647
}

function buildDefaultQueryParams (geo) {
  let { latitude, longitude } = geo
  const numberOfResults = 1
  // if no search for lat and long, use DC area coordinates
  if (!(latitude && longitude)) {
    latitude = defaultGeocode.latitude
    longitude = defaultGeocode.longitude
  }
  let params = {
    query: `matchall`,
    sort: 'distance asc',
    return: '_all_fields,distance',
    expr: `{"distance":"haversin(${latitude},${longitude},geolocation.latitude,geolocation.longitude)"}`,
    queryParser: 'structured',
    size: numberOfResults,
    start: 0
  }
  return params
}

function buildParams (query, geo) {
  const { pageSize, start, lenderName } = query
  const { latitude, longitude } = geo
  const defaultPageSize = 5
  const defaultStart = 0
  const queryString = lenderName ? `lender_name: '${cloudsearch.formatString(lenderName)}'` : 'matchall'

  let params = {
    query: queryString,
    return: '_all_fields',
    sort: 'lender_name asc',
    queryParser: 'structured',
    size: pageSize || defaultPageSize,
    start: start || defaultStart
  }

  if (latitude && longitude) {
    params = Object.assign({}, params, {
      sort: 'distance asc',
      return: '_all_fields,distance',
      expr: `{"distance":"haversin(${latitude},${longitude},geolocation.latitude,geolocation.longitude)"}`
    })
  }
  return params
}

function titleCase (str) {
  var splitStr = str.toLowerCase().split(' ')
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
  }
  return splitStr.join(' ')
}

function dedupSuggester (result) {
  var i
  let dedupSuggestions = []
  let suggestions = result ? result.suggest.suggestions : ''

  for (i = 0; i < suggestions.length; i++) {
    dedupSuggestions.push(
      titleCase(suggestions[i]
        .suggestion
        .split(' - ')[0]
        .replace(/ atm/gi, '')
      )
    )
  }
  return [...new Set(dedupSuggestions)]
}

async function fetchSuggestions (query) {
  const { lenderName } = query
  try {
    let params = {
      query: `'${cloudsearch.formatString(lenderName)}'`,
      suggester: 'lender_name_suggester',
      size: '10'
    }
    const result = await cloudsearch.runSuggester(params, endpoint) // call the module.exports version for stubbing during testing

    return dedupSuggester(result)
  } catch (err) {
    console.error(err, err.stack)
    throw new Error('Failed to fetch suggestions')
  }
}

async function fetchLenders (query) {
  const queryObj = query || {}
  const { address, mapCenter } = queryObj

  let geo = await location.generateGeocode(address, mapCenter)

  try {
    const params = buildParams(queryObj, geo)
    const result = await cloudsearch.runSearch(params, endpoint) // call the module.exports version for stubbing during testing
    const hits = result.hits
    if (hits && hits.found > 0) {
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
    } else {
      const defaultParams = buildDefaultQueryParams(geo)
      const suggestedResults = await cloudsearch.runSearch(defaultParams, endpoint)
      return Object.assign({}, hits, { suggestedResults: suggestedResults.hits })
    }
  } catch (err) {
    console.error(err, err.stack)
    throw new Error('Failed to search cloudsearch for lenders')
  }
}

module.exports.fetchLenders = fetchLenders
module.exports.fetchSuggestions = fetchSuggestions
