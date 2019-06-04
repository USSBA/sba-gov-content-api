/* eslint-disable id-length,space-infix-ops, object-property-newline */
const moment = require('moment')
const langParser = require('accept-language-parser')
const { filter, includes, isEmpty, map } = require('lodash')

const config = require('../config')
const s3CacheReader = require('../clients/s3-cache-reader.js')

const langCodes = { es: 'es', en: 'en' }

function fetchFormattedNode (nodeId, options) {
  let langCode = langParser.parse(options.headers['Accept-Language']).filter(lang => {
    return langCodes.hasOwnProperty(lang.code)
  })

  langCode = isEmpty(langCode) ? 'en' : langCode[0].code

  return s3CacheReader.getKey(nodeId).then(result => {
    const spanishResult = result && result.spanishTranslation

    if (spanishResult && langCode === langCodes.es) {
      return spanishResult
    } else {
      return result
    }
  })
}

function fetchContacts (queryParams) {
  return s3CacheReader.getKey('contacts').then(result => {
    return filter(result, queryParams)
  })
}

function fetchFormattedMenu () {
  return s3CacheReader.getKey('siteMap')
}

function fetchCounsellorCta () {
  const counsellorCtaNodeId = config.get('counsellorCta.nodeId')
  return s3CacheReader.getKey(counsellorCtaNodeId).then(data => {
    return Object.assign({}, data, {
      size: 'Large'
    })
  })
}

function fetchTaxonomys (queryParams) {
  return s3CacheReader.getKey('taxonomys').then(data => {
    if (queryParams) {
      let names = map(data, 'name')

      if (queryParams.names) {
        names = queryParams.names.split(',')
      }

      return data.filter(item => {
        return includes(names, item.name)
      })
    }
  })
}

function fetchAnnouncements () {
  return s3CacheReader.getKey('announcements').then(result => {
    return result
  })
}

function fetchNodes () {
  return s3CacheReader.getKey('nodes')
}

function fetchDisaster () {
  return s3CacheReader.getKey('disaster')
}

function fetchMainMenu () {
  return s3CacheReader.getKey('mainMenu')
}

function fetchAllCourses () {
  return s3CacheReader.getKey('courses')
}

function fetchOfficesRaw () {
  return s3CacheReader.getKey('offices')
}

async function fetchPersons ({ order }) {
  const offices = await s3CacheReader.getKey('offices')
  const persons = await s3CacheReader.getKey('persons')

  const officeIdToNameMap = new Map()
  offices.forEach(({ id, officeType, title }) => officeIdToNameMap.set(id, { id, name: title, type: officeType }))

  const personsWithOfficeName = persons.map(person => {
    const office = officeIdToNameMap.get(person.office)

    return {
      ...person,
      ...(office && { office })
    }
  })

  return personsWithOfficeName.sort((a, b) => {
    if (isEmpty(a.lastName)) return 1
    if (isEmpty(b.lastName)) return -1

    return a.lastName.localeCompare(b.lastName)
  })
}

module.exports.fetchAllCourses = fetchAllCourses
module.exports.fetchAnnouncements = fetchAnnouncements
module.exports.fetchContacts = fetchContacts
module.exports.fetchCounsellorCta = fetchCounsellorCta
module.exports.fetchDisaster = fetchDisaster
module.exports.fetchFormattedMenu = fetchFormattedMenu
module.exports.fetchFormattedNode = fetchFormattedNode
module.exports.fetchMainMenu = fetchMainMenu
module.exports.fetchNodes = fetchNodes
module.exports.fetchOfficesRaw = fetchOfficesRaw
module.exports.fetchPersons = fetchPersons
module.exports.fetchTaxonomys = fetchTaxonomys
