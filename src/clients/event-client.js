const axios = require('axios')
const config = require('../config')

async function getEvents (query) {
  try {
    const url = `https://${config.eventsApi.hostname}/${config.eventsApi.endpoint}`
    const response = await axios.get(url, {
      params: query
    })

    if (response.data) {
      return response.data
    } else {
      return null
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports.getEvents = getEvents
