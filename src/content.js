const HttpStatus = require('http-status-codes')
const config = require('./config.js')
const {
  fetchAnnouncements,
  fetchContacts,
  fetchCounsellorCta,
  fetchDisaster,
  fetchFormattedMenu,
  fetchFormattedNode,
  fetchMainMenu,
  fetchNodes,
  fetchOfficesRaw,
  fetchPersons,
  fetchTaxonomys
} = require('./service/drupal-eight.js')
const articleSearch = require('./service/article-search.js')
const { getAuthors } = require('./service/authors.js')
const { fetchBlogs, fetchBlog } = require('./service/blogs.js')
const { fetchCourses, fetchCourse } = require('./service/courses.js')
const { fetchDocuments } = require('./service/documents.js')
const { fetchOffices } = require('./service/office-search.js')
const d7Events = require('./service/events.js')
const d8Events = require('./service/event-search.js')
const events = config.eventsApi.getBackendSourceToggle() !== 'true' ? d7Events : d8Events
const { fetchEvents } = events
const { runSearch } = require('./service/search.js')
const { getSuggestedRoutes } = require('./service/suggested-routes.js')

async function fetchContentById (params, headers) {
  const fetchFunctionsMap = {
    node: fetchFormattedNode
  }

  if (config.eventsApi.getBackendSourceToggle() !== 'true') {
    fetchFunctionsMap.event = events.fetchEventById
  }

  if (params && params.type && params.id) {
    const type = params.type
    const id = params.id
    const fetchFunction = fetchFunctionsMap[type]

    if (fetchFunction) {
      try {
        let result = await fetchFunction(id, {
          headers
        })
        if (result) {
          return {
            statusCode: HttpStatus.OK,
            body: result
          }
        } else {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            body: `Unable to find ${type} with id ${id}`
          }
        }
      } catch (e) {
        console.error('Error fetching data: ', e)
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          body: `Server Error, ${e}`
        }
      }
    } else {
      return {
        statusCode: HttpStatus.NOT_FOUND,
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
  const typeFunctionsMap = {
    announcements: fetchAnnouncements,
    articles: articleSearch.fetchArticles,
    blog: fetchBlog,
    blogs: fetchBlogs,
    contacts: fetchContacts,
    counsellorCta: fetchCounsellorCta,
    course: fetchCourse,
    courses: fetchCourses,
    disaster: fetchDisaster,
    documents: fetchDocuments,
    events: fetchEvents,
    mainMenu: fetchMainMenu,
    nodes: fetchNodes,
    offices: fetchOffices,
    officesRaw: fetchOfficesRaw,
    persons: fetchPersons,
    search: runSearch,
    siteMap: fetchFormattedMenu,
    suggestedRoutes: getSuggestedRoutes,
    taxonomys: fetchTaxonomys,
    authors: getAuthors
  }

  if (pathParams && pathParams.type) {
    const type = pathParams.type
    const fetchFunction = typeFunctionsMap[type]

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
          body: `Server Error, ${e}`
        }
      }
    } else {
      return {
        statusCode: HttpStatus.NOT_FOUND,
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
