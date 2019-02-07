const axios = require('axios')
const config = require('../config')

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

function fetchEvents () {
  return require('./response.json')
}

module.exports.fetchEvents = fetchEvents
module.exports.getOrganizationId = getOrganizationId
