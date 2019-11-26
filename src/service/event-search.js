const config = require('../config')
const moment = require('moment-timezone')
const location = require('./location.js')
const cloudsearch = require('../clients/cloudsearch.js')

const endpoint = config.cloudSearch.eventEndpoint

function buildQuery (query, dateRange, office) {
  // if no date range is given, create a starting date range based on current time to exclude old events
  let dateRangeString
  if (dateRange) {
    const dateRanges = dateRange ? dateRange.split(',') : [moment.utc().format()]
    const formattedStartDateString = `['${dateRanges[0]}'`
    const formattedEndDateString = dateRanges[1] ? `'${dateRanges[1]}']` : `}`
    dateRangeString = `${formattedStartDateString},${formattedEndDateString}`
  } else {
    dateRangeString = `['${moment.utc().format()}',}`
  }

  const keywordQueryStatements = []
  let keywordQueryString
  if (query) {
    const fieldsToSearch = ['description', 'name', 'summary']
    for (const field of fieldsToSearch) {
      keywordQueryStatements.push(`${field}: '${cloudsearch.formatString(query)}'`)
    }
  }

  if (keywordQueryStatements.length > 1) {
    keywordQueryString = `(or ${keywordQueryStatements.join(' ')})`
  }

  let officeQueryString
  if (office) {
    officeQueryString = `hostoffice: '${office}'`
  }

  // we always include the starting date range in a default search to exclude old events
  let queryString, dateRangeQueryString
  if (keywordQueryString && officeQueryString) {
    dateRangeQueryString = `(range field=startdatetime ${dateRangeString})`
    queryString = `(and ${dateRangeQueryString} ${keywordQueryString} ${officeQueryString})`
  } else if (keywordQueryString) {
    dateRangeQueryString = `(range field=startdatetime ${dateRangeString})`
    queryString = `(and ${dateRangeQueryString} ${keywordQueryString})`
  } else if (officeQueryString) {
    dateRangeQueryString = `(range field=startdatetime ${dateRangeString})`
    queryString = `(and ${dateRangeQueryString} ${officeQueryString})`
  } else {
    dateRangeQueryString = `startdatetime: ${dateRangeString}`
    queryString = dateRangeQueryString
  }

  return queryString
}

function buildParams (query, geo) {
  const { pageSize, start, distance, dateRange, q, office } = query // eslint-disable-line id-length
  const { latitude, longitude } = geo
  const queryString = buildQuery(q, dateRange, office)
  const defaultPageSize = 20
  const defaultStart = 0
  let params = {
    query: queryString,
    return: '_all_fields',
    sort: 'startdatetime asc',
    queryParser: 'structured',
    size: pageSize || defaultPageSize,
    start: start || defaultStart
  }

  if (latitude && longitude) {
    const { northeast, southwest } = location.computeBoundingBoxWithMiles(latitude, longitude, distance)
    params = Object.assign({}, params, {
      // geolib and cloudsearch use different corners for the bounding box which needs to be accounted for
      filterQuery: `geolocation:['${northeast.latitude},${southwest.longitude}','${southwest.latitude},${northeast.longitude}']`
    })
  }
  return params
}

async function fetchEvents (query) {
  const queryObj = query || {}
  const { address, mapCenter } = queryObj
  let geo = await location.generateGeocode(address, mapCenter)

  const params = buildParams(queryObj, geo)
  try {
    const result = await cloudsearch.runSearch(params, endpoint) // call the module.exports version for stubbing during testing
    const hits = result.hits
    const newHitList = hits.hit.map(item => {
      let _item = item
      if (item && item.exprs && item.exprs.distance >= 0) {
        if (!address) {
          _item = Object.assign({}, item)
          delete _item.exprs
        } else {
          _item = Object.assign({}, item, {
            exprs: {
              // for now put a 0 but later this will have to add in the distance in order
              // to filter by geolocation
              distance: 0// item.exprs.distance / kilometersPerMile
            }
          })
        }
      }
      return _item
    })
    return Object.assign({}, hits, {
      hit: newHitList
    })
  } catch (err) {
    console.error(err, err.stack)
    throw new Error('Failed to search cloudsearch for events')
  }
}

module.exports = {
  buildQuery,
  buildParams,
  fetchEvents
}
