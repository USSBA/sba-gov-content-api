const config = require('../config')
const aws = require('aws-sdk')
const csd = new aws.CloudSearchDomain({
  endpoint: config.cloudSearch.officeEndpoint,
  region: 'us-east-1',
  apiVersions: '2013-01-01'
})

const kilometersPerMile = 1.60934
const dynamoDbClient = require('../clients/dynamo-db-client.js')

// for testing purposes
async function runSearch (params) {
  const result = await csd.search(params).promise()
  return result
}

// function buildFilterQuery(req) {
//   const filters = buildFilters(req)
//   const filterArray = []
//   //todo use lodash to filter out empty filters
//   for (const filter of filters) {
//     if (filter) {
//       filterArray.push(filter)
//     }
//   }
//   return filterArray.length ? `(and ${filterArray.join(' ')})` : null
// }

// function buildIsSbaOfficeFilterQuery(isSbaOffice) {
//   let sbaOfficeString = ''
//   if (isSbaOffice && (isSbaOffice === true || isSbaOffice.toLowerCase() === 'true')) {
//     const sbaOfficeNames = config.get('features.office.sbaOfficeNames')
//     const sbaSearchStrings = sbaOfficeNames.map(officeName => {
//       return `office_type: '${formatString(officeName)}'`
//     })
//     if (sbaOfficeNames.length === 1) {
//       sbaOfficeString = sbaSearchStrings[0]
//     } else if (sbaOfficeNames.length > 1) {
//       sbaOfficeString = `(or ${sbaSearchStrings.join(' ')})`
//     }
//   }
//   return sbaOfficeString
// }

function formatString (string) {
  let result = decodeURI(string)
  // cloudsearch requires us to escape backslashes and quotes
  result = result.replace(/\\/g, '\\\\')
  result = result.replace(/'/g, "\\'")
  return result
}

function buildQuery (query) {
  const queryStatements = []
  let queryString = `type: 'office'`

  if (query) {
    const fieldsToSearch = ['title', 'location_name', 'office_type']
    for (const field of fieldsToSearch) {
      queryStatements.push(`${field}: '${formatString(query)}'`)
    }
  }
  if (queryStatements.length > 1) {
    queryString = `(or ${queryStatements.join(' ')})`
  }
  return queryString
}

function buildFilters (service, type) {
  let filters = [
    service ? `office_service: '${formatString(service)}'` : null,
    type ? `office_type: '${formatString(type)}'` : null
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

function buildParams (query, geo) {
  const { pageSize, start, q, service, type, distance } = query // eslint-disable-line id-length
  const { latitude, longitude } = geo
  const filterString = buildFilters(service, type, distance)
  const queryString = buildQuery(q)
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

async function computeLocation (address) {
  if (!address) {
    return {
      latitude: null,
      longitude: null
    }
  }

  const params = {
    TableName: config.zipCodeDynamoDbTable,
    KeyConditionExpression: 'zip = :zipval',
    ExpressionAttributeValues: {
      ':zipval': address
    }
  }
  try {
    const result = await dynamoDbClient.queryDynamoDb(params)
    // assumes that there is only one record in DynamoDB per zipcode
    const item = result.Items[0]
    if (item) {
      return {
        latitude: item.latitude,
        longitude: item.longitude
      }
    } else {
      return null
    }
  } catch (err) {
    console.error(err)
    throw new Error("Failed to geocode user's location")
  }
}
function parseGeocodeString (geocodeString) {
  const [latitude, longitude] = decodeURI(geocodeString).split(',')
  return {
    latitude: latitude,
    longitude: longitude
  }
}

/* This is separate from search because it will need to have custom search to handle searching by specific indecies */
async function fetchOffices (query) {
  const { address, mapCenter } = query
  let geo
  if (address) {
    geo = await computeLocation(address)
  } else {
    geo = parseGeocodeString(mapCenter)
  }
  if (!geo) {
    return []
  }
  const params = buildParams(query, geo)
  try {
    const result = await module.exports.runSearch(params) // call the module.exports version for stubbing during testing
    const hits = result.hits
    if (hits && hits.length > 0) {
      const newHitList = hits.hit.map(item => {
        if (item && item.exprs && item.exprs.distance >= 0) {
          let _item
          if(!address) {
            _item  = Object.assign({}, item)
            delete _item.exprs
          } else {
            _item = Object.assign({}, item, { exprs: { distance: item.exprs.distance / kilometersPerMile } })
          }
          return _item

        }
      })
      return Object.assign({}, hits, { hit: newHitList })
    } else {
      return hits
    }
  } catch (err) {
    console.error(err, err.stack)
    throw new Error('Failed to search cloudsearch for offices')
  }
}

module.exports.fetchOffices = fetchOffices
module.exports.computeLocation = computeLocation

// for testing purposes
module.exports.runSearch = runSearch