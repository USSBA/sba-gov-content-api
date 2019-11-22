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
const lookupArticles = require('./service/articles.js')
const lookupDistrictOfficeArticles = require('./service/article-search.js')
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
  /*
  Permission Toggle Feature Flag 11/22/2019

  endpoint: /api/content/search/articles.json is invoked by both <katanaUrl>/article and <katanaUrl>/offices/district/<districtOfficeId>

  <katanaUrl>/article
  returns daisho formatted json objects, which have camelCase formatted properties.

  <katanaUrl>/offices/district/<districtOfficeId>
  returns cloudsearch formatted json objects, which have snake_case formatted properties.

  For now, we should enable this endpoint (articles.json) to be configurable by the request.

  the queryStringParameter, "mode: articleLookup|districtOffice" toggles the article-search.json and the articles.json files, respectively.

  Please note, by default articles.json is selected. article-search.json is only selected if mode is set to "districtOffice".

  In the future, articles.json functionality should be ported into article-search.json but in order to do that,
  the <katanaUrl>/article page has to be able to parse cloudsearch formatted json.

  */

  let fetchArticles
  if (pathParams) {
    fetchArticles = pathParams.type === 'articles' && queryStringParameters.mode === 'districtOffice' ? lookupDistrictOfficeArticles.fetchArticles : lookupArticles.fetchArticles
  }

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
