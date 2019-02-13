const axios = require('axios')
const config = require('../config')
const mockDataEvents = require('./mock-events-data.json')

async function getOrganizationId () {
  try {
    const response = await axios.get(`https://www.eventbriteapi.com/v3/users/me/organizations`, {
      params: {
        token: config.eventbriteApi.token
      }
    })

    if (response.data.organizations[0].id) {
      return response.data.organizations[0].id
    } else {
      return null
    }
  } catch (error) {
    console.error(error)
  }
}

function fetchEvents (query) {
  let result = mockDataEvents
  const queryObj = query || {}
  const { address } = queryObj
  // if zipcode param is available
    // filter by zipcode
  if (address) {
    result = result.filter( item => {
      return item.location.zipcode === address
    })
  }

  return result
}

module.exports.fetchEvents = fetchEvents
module.exports.getOrganizationId = getOrganizationId
