const HttpStatus = require('http-status-codes')
const s3CacheReader = require('./s3-cache-reader.js')
const {
  fetchAnnouncements,
  fetchArticles,
  fetchContacts,
  fetchCounsellorCta,
  fetchDocuments,
  fetchFormattedMenu,
  fetchFormattedNode,
  fetchNodes,
  fetchTaxonomys
} = require('../service/drupal-eight.js')
const { fetchCourses, fetchCourse } = require('../service/courses.js')
const { runSearch } = require('../service/search.js')
const { fetchOffices } = require('../service/office-search.js')

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
  disaster: s3CacheReader.getKey,
  documents: fetchDocuments,
  offices: fetchOffices,
  mainMenu: s3CacheReader.getKey,
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
        return result
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

async function fetchContentByType (params) {
  if (params && params.type) {
    const type = params.type
    const fetchFunction = fetchContentTypeFunctions[type]
    if (fetchFunction) {
      try {
        let result = await fetchFunction()
        return result
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

module.exports.fetchContentById = fetchContentById;
module.exports.fetchContentByType = fetchContentByType;

