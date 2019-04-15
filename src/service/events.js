const eventClient = require('../clients/event-client.js')
const moment = require('moment-timezone')
const he = require('he')

function translateQueryParamsForD7 (query) {
  const queryObj = query || {}
  const { q, address, dateRange, distance, start } = queryObj
  let params = {}
  if (address) {
    if (distance) {
      params['distance[postal_code]'] = address
      params['distance[search_distance]'] = distance
    } else {
      params.postal_code = address
    }
  }

  if (q) {
    params.title = q
    params.body_value = q
  }

  if (dateRange) {
    let today = moment().format('YYYY-MM-DD')

    switch (dateRange) {
      case 'today':
        params['field_event_date_value[value][date]'] = today
        params['field_event_date_value2[value][date]'] = today
        break
      case 'tomorrow':
        let tomorrow = moment().add(1, 'd').format('YYYY-MM-DD')
        params['field_event_date_value[value][date]'] = tomorrow
        params['field_event_date_value2[value][date]'] = tomorrow
        break
      case '7days':
        let sevenDaysFromNow = moment().add(7, 'd').format('YYYY-MM-DD')
        params['field_event_date_value[value][date]'] = today
        params['field_event_date_value2[value][date]'] = sevenDaysFromNow
        break
      case '30days':
        let thirtyDaysFromNow = moment().add(30, 'd').format('YYYY-MM-DD')
        params['field_event_date_value[value][date]'] = today
        params['field_event_date_value2[value][date]'] = thirtyDaysFromNow
        break
      default:
    }
  }

  if (start) {
    params.offset = start
  }

  return params
}

function clean (value) {
  if (Array.isArray(value) && value.length === 0) {
    return null
  } else {
    return value
  }
}

function formatDate (dateString, timezone) {
  if (dateString) {
    console.log(moment.tz(dateString, timezone).format())
    return moment(dateString).format()
  } else {
    return null
  }
}

function mapD7EventDataToBetterSchema (item) {
  try {
    if (!item) {
      return null
    }
    let dateInformation = { start: null, end: null }
    let dateSplit = item.field_event_date.split(' to ')
    if (Array.isArray(dateSplit) && dateSplit.length === 2) {
      dateInformation = Object.assign(dateInformation, { start: formatDate(dateSplit[0], item.field_time_zone), end: formatDate(dateSplit[1], item.field_time_zone) })
    } else if (Array.isArray(dateSplit) && dateSplit.length === 1) {
      dateInformation = Object.assign(dateInformation, { start: formatDate(dateSplit[0], item.field_time_zone) })
    }

    let result = {
      title: he.decode(item.title),
      type: 'event',
      description: item.body,
      id: item.nid,
      registrationUrl: clean(item.field_event_link),
      startDate: dateInformation.start,
      endDate: dateInformation.end,
      timezone: moment(dateInformation.start).tz(item.field_time_zone).format('z'),
      cost: clean(item.field_event_fee) || '0.00',
      locationType: item.field_event_is_virtual,
      location: {
        name: item.name,
        address: item.street,
        address_additional: item.additional,
        city: item.city,
        zipcode: item.postal_code,
        state: item.province,
        latitude: item.latitude,
        longitude: item.longitude
      },
      contact: {
        name: clean(item.field_event_contact_name),
        email: clean(item.field_event_contact_email),
        phone: clean(item.field_event_registration_phone)
      },
      sponsor: {
        type: clean(item.field_event_office_type),
        sponsorName: clean(item.field_event_affiliation)
      },
      organizer: clean(item.field_event_org),
      recurring: clean(item.field_event_repeat),
      recurringType: clean(item.field_event_recur_type)
    }
    // remove undefined properties; sometimes D7 returns properties without values as [] and sometimes as undefined
    result = JSON.parse(JSON.stringify(result))
    return result
  } catch (e) {
    console.error('Failed to map D7 Event: ', e)
    return null
  }
}

async function fetchEventById (id) {
  let result = await eventClient.getEvents({ nid: id })
  if (Array.isArray(result) && result.length !== 0) {
    return mapD7EventDataToBetterSchema(result[0])
  } else {
    return {}
  }
}

async function fetchTotalLength (params) {
  let lastOffset = 0
  let totalCount = 0
  let more = true
  while (more) {
    let newParams = Object.assign({}, params, { offset: lastOffset })
    let results = await eventClient.getEventCount(newParams)
    let length = results.length
    totalCount += length
    if (length < 1000 || totalCount > 9999) {
      more = false
    } else {
      lastOffset += 1000
    }
  }
  return totalCount
}

async function fetchEvents (query) {
  let params = translateQueryParamsForD7(query)
  let results = await eventClient.getEvents(params)
  let mappedResults = results.map(mapD7EventDataToBetterSchema)
  mappedResults = mappedResults.filter(item => item)

  let totalCount = await fetchTotalLength(params)

  return { count: totalCount, items: mappedResults }
}

module.exports.fetchEvents = fetchEvents
module.exports.fetchEventById = fetchEventById
module.exports.fetchTotalLength = fetchTotalLength
module.exports.mapD7EventDataToBetterSchema = mapD7EventDataToBetterSchema
