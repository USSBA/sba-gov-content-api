const { getBoundsOfDistance } = require('geolib')

const config = require('../config')
const dynamoDbClient = require('../clients/dynamo-db-client.js')

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

function computeBoundingBoxWithMiles (centerLat, centerLong, distance) {
  const metersPerMile = 1609.344
  const distanceInMiles = distance * metersPerMile
  const bounds = getBoundsOfDistance({ latitude: centerLat, longitude: centerLong }, distanceInMiles)

  return {northeast: bounds[1],
    southwest: bounds[0]}
}

module.exports.computeBoundingBoxWithMiles = computeBoundingBoxWithMiles
module.exports.computeLocation = computeLocation
