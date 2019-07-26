const config = require('../config')
const aws = require('aws-sdk')
const moment = require('moment-timezone')
const location = require('./location.js')
let csd

function formatString (string) {
  let result = decodeURI(string)
  // cloudsearch requires us to escape backslashes and quotes
  result = result.replace(/\\/g, '\\\\')
  result = result.replace(/'/g, "\\'")
  return result
}

async function runSearch (params) {
  csd = csd || new aws.CloudSearchDomain({
    endpoint: config.cloudSearch.eventEndpoint,
    region: 'us-east-1',
    apiVersions: '2013-01-01'
  })
  const result = await csd.search(params).promise()
  return result
}

function buildQuery (query) {
  const queryStatements = []
  let queryString = `startdatetime: ['${moment.utc().format()}',}`

  if (query) {
    const fieldsToSearch = ['description', 'name', 'summary']
    for (const field of fieldsToSearch) {
      queryStatements.push(`${field}: '${formatString(query)}'`)
    }
  }
  if (queryStatements.length > 1) {
    queryString = `(or ${queryStatements.join(' ')})`
  }
  return queryString
}

function buildParams (query, geo) {
  const { pageSize, start, distance, q } = query // eslint-disable-line id-length
  const { latitude, longitude } = geo
  const queryString = buildQuery(q)
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

  /*
  The event-search.js file is a fork of the office-search.js file.

  Anything that references distance or geolocation stuff purposely does not work.

  I decided to keep in pieces that reference geolocation, such as this line, so as to make future tickets that reference distance functionality easier to implement.
  */
  if (latitude && longitude) {
    const { northeast, southwest } = location.computeBoundingBoxWithMiles(latitude, longitude, distance)
    params = Object.assign({}, params, {
      // sort: 'distance asc',
      return: '_all_fields,distance',
      expr: `{"fq"="location:['${northeast.latitude},${northeast.longitude}','${southwest.latitude},${southwest.longitude}']"}`
    })
  }
  return params
}

async function fetchEvents (query) {
  const queryObj = query || {}
  // let geo
  const { address, mapCenter } = queryObj
  let geo = await location.generateGeocode(address, mapCenter)
  // if (address) {
  //   geo = await location.computeLocation(address)
  // } else {
  //   geo = location.parseGeocodeString(mapCenter)
  // }

  const params = buildParams(queryObj, geo)
  // const params = buildParams(queryObj, {})
  try {
    const result = await module.exports.runSearch(params) // call the module.exports version for stubbing during testing
    const hits = result.hits
    const newHitList = hits.hit.map(item => {
      let _item = item
      if (item && item.exprs && item.exprs.distance >= 0) {
        // _item = Object.assign({}, item)
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
  runSearch,
  buildQuery,
  buildParams,
  fetchEvents
}
