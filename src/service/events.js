const moment = require('moment')
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
  const { address, dateRange } = queryObj
  // if zipcode param is available
    // filter by zipcode
  if (address) {
    result = result.filter( item => {
      return item.location.zipcode === address
    })
  }

  if (dateRange) {
    let now = moment().format()

    switch (dateRange) {
      case 'today':
        let today = moment(now).format("YYYY-MM-DD")
        result = result.filter(result => today == moment(result.start_date).format("YYYY-MM-DD"))
        break;
      case 'tomorrow':
        let tomorrow = moment(moment(now).add(1, 'd')).format("YYYY-MM-DD")
        result = result.filter(result => tomorrow == moment(result.start_date).format("YYYY-MM-DD")) 
        break;
      case '7days':
        let sevenDay = moment(now).add(7, 'd')
        result = result.filter(result => moment(result.start_date).isBetween(now, sevenDay))
        break;
      case '30days':
        let thirtyDay = moment(now).add(30, 'd')
        result = result.filter(result => moment(result.start_date).isBetween(now, thirtyDay))
        break;
      default:
    }
    
  }

  return result
}

module.exports.fetchEvents = fetchEvents
module.exports.getOrganizationId = getOrganizationId
