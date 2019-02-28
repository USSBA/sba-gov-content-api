const axios = require('axios')
const config = require('../config')


async function fetch (endpoint, query) {
  try {
    const url = `https://${config.eventsApi.hostname}/${endpoint}`
    console.log(`Querying ${url} with ${JSON.stringify(query)}`)
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
    return null;
  }
}



async function getEvents (query) {
  return fetch(config.eventsApi.endpoint, query)
}

async function getEventCount (query) {
  return fetch(config.eventsApi.countEndpoint, query)
}




module.exports.getEvents = getEvents
module.exports.getEventCount = getEventCount
