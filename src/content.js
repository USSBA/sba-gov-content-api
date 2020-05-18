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
const { fetchArticles } = require('./service/article-search.js')
const { getAuthors } = require('./service/authors.js')
const { fetchBlogs, fetchBlog } = require('./service/blogs.js')
const { fetchCourses, fetchCourse } = require('./service/courses.js')
const { fetchDocuments } = require('./service/documents.js')
const { fetchOffices } = require('./service/office-search.js')
const { fetchLenders } = require('./service/lender-search.js')
const { fetchSuggestions } = require('./service/lender-search.js')
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

  fetchFunctionsMap.events = config.eventsApi.getBackendSourceToggle() !== 'true' ? events.fetchEventById : events.fetchEvents

  if (params && params.type && params.id) {
    const type = params.type
    const id = params.id
    const fetchFunction = fetchFunctionsMap[type]

    if (fetchFunction) {
      try {
        const args = config.eventsApi.getBackendSourceToggle() === 'true' && type === 'events' ? { id } : id
        let result = await fetchFunction(args, {
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
    articles: fetchArticles,
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
    lenders: fetchLenders,
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
