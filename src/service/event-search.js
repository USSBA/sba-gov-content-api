const config = require('../config')
const aws = require('aws-sdk')
let csd

function formatString (string) {
  let result = decodeURI(string)
  // cloudsearch requires us to escape backslashes and quotes
  result = result.replace(/\\/g, '\\\\')
  result = result.replace(/'/g, "\\'")
  return result
}

// for testing purposes
async function runSearch (params) {
  csd = csd || new aws.CloudSearchDomain({
    endpoint: config.get('cloudSearch').eventEndpoint,
    region: 'us-east-1',
    apiVersions: '2013-01-01'
  })
  const result = await csd.search(params).promise()
  return result
}

function buildQuery (query) {
  const queryStatements = []
  let queryString

  if (query) {
    const fieldsToSearch = ['description', 'name', 'summary']
    for (const field of fieldsToSearch) {
      queryStatements.push(`${field}: '${formatString(query)}'`)
    }
  }
  if (queryStatements.length > 1) {
    queryString = queryStatements.join(' ')
  }
  return queryString
}

function buildParams (query, geo) {
  const { pageSize, start, q } = query // eslint-disable-line id-length
  const { latitude, longitude } = geo
  const queryString = buildQuery(q)
  const defaultPageSize = 20
  const defaultStart = 0
  let params = {
    query: queryString,
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

async function fetchEvents (query) {
  console.log('A--')
  const queryObj = query || {}
  const {
        address
    } = queryObj
  // let geo
    // if (address) {
    //     geo = await computeLocation(address)
    // } else {
    //     geo = parseGeocodeString(mapCenter)
    // }

    // const params = buildParams(queryObj, geo)
  const params = buildParams(queryObj, {})
  try {
    console.log('B--')
    const result = await module.exports.runSearch(params) // call the module.exports version for stubbing during testing
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
              distance: 0// item.exprs.distance / kilometersPerMile
            }
          })
        }
      }
      return _item
    })
    console.log('C--')
    return Object.assign({}, hits, {
      hit: newHitList
    })
  } catch (err) {
    console.log('D--')
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
