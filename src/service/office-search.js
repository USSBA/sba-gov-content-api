const config = require('../config')
const cloudsearch = require('../clients/cloudsearch.js')
const location = require('./location.js')

const endpoint = config.cloudSearch.officeEndpoint
const defaultOfficeType = 'SBA district office'
const defaultOfficeGeocode = {
  latitude: 38.893311,
  longitude: -77.014647
}

function buildQuery (query, id) {
  const queryStatements = []
  let queryString = `type: 'office'`

  if (query) {
    const fieldsToSearch = ['title', 'location_name', 'office_type']
    for (const field of fieldsToSearch) {
      queryStatements.push(`${field}: '${cloudsearch.formatString(query)}'`)
    }
  }

  if (id) {
    queryStatements.push(`_id: ${id}`)
  }

  if (queryStatements.length > 1 || id) {
    queryString = `(or ${queryStatements.join(' ')})`
  }

  return queryString
}

function buildFilters (service, type) {
  const officeTypes = type ? type.split(',') : []
  const formattedTypes = officeTypes.map((type) => { return `office_type:'${cloudsearch.formatString(type)}'` })
  let filters = [
    service ? `office_service: '${cloudsearch.formatString(service)}'` : null,
    formattedTypes.length > 0 ? `(or ${formattedTypes.join(' ')})` : null
  ]
  filters = filters.filter(item => item)
  let filterString = null
  if (filters.length === 1) {
    filterString = filters[0]
  } else if (filters.length > 1) {
    filterString = `(and ${filters.join(' ')})`
  }
  return filterString
}

function buildDefaultOfficeQueryParams (geo) {
  let { latitude, longitude } = geo
  const numberOfResults = 1
  // if no search for lat and long, use dc office coordinates
  if (!(latitude && longitude)) {
    latitude = defaultOfficeGeocode.latitude
    longitude = defaultOfficeGeocode.longitude
  }
  let params = {
    query: `type: 'office'`,
    filterQuery: `office_type: '${defaultOfficeType}'`,
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
  const { pageSize, start, q, service, type, distance, id } = query // eslint-disable-line id-length
  const { latitude, longitude } = geo
  const filterString = buildFilters(service, type, distance)
  const queryString = buildQuery(q, id)
  const defaultPageSize = 20
  const defaultStart = 0
  let params = {
    query: queryString,
    filterQuery: filterString,
    return: '_all_fields',
    sort: 'title asc',
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

/* This is separate from search because it will need to have custom search to handle searching by specific indecies */
async function fetchOffices (query) {
  const queryObj = query || {}
  const { address, mapCenter } = queryObj

  let geo = await location.generateGeocode(address, mapCenter)

  const params = buildParams(queryObj, geo)
  try {
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
      const defaultParams = buildDefaultOfficeQueryParams(geo)
      const suggestedResults = await cloudsearch.runSearch(defaultParams, endpoint)
      return Object.assign({}, hits, { suggestedResults: suggestedResults.hits })
    }
  } catch (err) {
    console.error(err, err.stack)
    throw new Error('Failed to search cloudsearch for offices')
  }
}

module.exports.fetchOffices = fetchOffices
