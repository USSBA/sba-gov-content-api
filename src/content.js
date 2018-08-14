const HttpStatus = require('http-status-codes')
const {
  fetchAnnouncements,
  fetchArticles,
  fetchContacts,
  fetchCounsellorCta,
  fetchDocuments,
  fetchFormattedMenu,
  fetchFormattedNode,
  fetchNodes,
  fetchTaxonomys,
  fetchDisaster,
  fetchMainMenu
} = require('./service/drupal-eight.js')
const { fetchCourses, fetchCourse } = require('./service/courses.js')
const { runSearch } = require('./service/search.js')
const { fetchOffices } = require('./service/office-search.js')

const fetchFunctions = {
  node: fetchFormattedNode
}

const fetchContentTypeFunctions = {
  announcements: fetchAnnouncements,
  articles: fetchArticles,
  contacts: fetchContacts,
  counsellorCta: fetchCounsellorCta,
  courses: fetchCourses,
  course: fetchCourse,
  disaster: fetchDisaster,
  documents: fetchDocuments,
  offices: fetchOffices,
  mainMenu: fetchMainMenu,
  nodes: fetchNodes,
  search: runSearch,
  siteMap: fetchFormattedMenu,
  taxonomys: fetchTaxonomys
}

async function fetchContentById (params, headers) {
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
      } catch (e) {
        console.error('Error fetching data: ', e)
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          body: 'Server Error'
        }
      }
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: 'Unknown type ' + type
      }
    }
  } else {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: 'Incorrect request format: missing type or id'
    }
  }
}

async function fetchContentByType (pathParams, queryStringParameters) {
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
      } catch (e) {
        console.error('Error fetching data: ', e)
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          body: 'Server Error'
        }
      }
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: 'Unknown type ' + type
      }
    }
  } else {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      body: 'Incorrect request format: missing type'
    }
  }
}

module.exports.fetchContentById = fetchContentById
module.exports.fetchContentByType = fetchContentByType
