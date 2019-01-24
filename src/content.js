const HttpStatus = require('http-status-codes')
const {
  fetchAnnouncements,
  fetchArticles,
  fetchContacts,
  fetchCounsellorCta,
  fetchDisaster,
  fetchDocuments,
  fetchFormattedMenu,
  fetchFormattedNode,
  fetchMainMenu,
  fetchNodes,
  fetchOfficesRaw,
  fetchPersons,
  fetchTaxonomys,
} = require('./service/drupal-eight.js')
const { fetchCourses, fetchCourse } = require('./service/courses.js')
const { runSearch } = require('./service/search.js')
const { fetchOffices } = require('./service/office-search.js')
const { fetchEvents } = require('./service/events.js')

const fetchFunctions = {
  node: fetchFormattedNode
}

const fetchContentTypeFunctions = {
  announcements: fetchAnnouncements,
  articles: fetchArticles,
  contacts: fetchContacts,
  counsellorCta: fetchCounsellorCta,
  course: fetchCourse,
  courses: fetchCourses,
  disaster: fetchDisaster,
  documents: fetchDocuments,
  mainMenu: fetchMainMenu,
  nodes: fetchNodes,
  offices: fetchOffices,
  officesRaw: fetchOfficesRaw,
  persons: fetchPersons,
  search: runSearch,
  siteMap: fetchFormattedMenu,
  taxonomys: fetchTaxonomys,
  events: fetchEvents
}

async function fetchContentById(params, headers) {
  if (params && params.type && params.id) {
    const type = params.type
    const id = params.id
    const fetchFunction = fetchFunctions[type]
    if (fetchFunction) {
      try {
        let result = await fetchFunction(id, {
          headers
        })
        return {
          statusCode: HttpStatus.OK,
          body: result
        }
      }
      catch (e) {
        console.error('Error fetching data: ', e)
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          body: `Server Error, ${e}`
        }
      }
    }
    else {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        body: 'Unknown type ' + type
      }
    }
  }
  else {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: 'Incorrect request format: missing type or id'
    }
  }
}

async function fetchContentByType(pathParams, queryStringParameters) {
  if (pathParams && pathParams.type) {
    const type = pathParams.type
    const fetchFunction = fetchContentTypeFunctions[type]
    if (fetchFunction) {
      try {
        let result = await fetchFunction(queryStringParameters)
        return {
          statusCode: HttpStatus.OK,
          body: result
        }
      }
      catch (e) {
        console.error('Error fetching data: ', e)
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          body: `Server Error, ${e}`
        }
      }
    }
    else {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        body: 'Unknown type ' + type
      }
    }
  }
  else {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: 'Incorrect request format: missing type'
    }
  }
}

module.exports.fetchContentById = fetchContentById
module.exports.fetchContentByType = fetchContentByType
