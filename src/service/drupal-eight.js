/* eslint-disable id-length,space-infix-ops, object-property-newline */
const moment = require('moment')
const langParser = require('accept-language-parser')
const { filter, includes, isEmpty, map, mapValues, maxBy, orderBy } = require('lodash')

const config = require('../config')
const { getKey } = require('../clients/s3-cache-reader.js')

const langCodes = { es: 'es', en: 'en' }

function fetchFormattedNode (nodeId, options) {
  let langCode = langParser.parse(options.headers['accept-language']).filter(lang => {
    return langCodes.hasOwnProperty(lang.code)
  })

  langCode = isEmpty(langCode) ? 'en' : langCode[0].code

  return getKey(nodeId).then(result => {
    const spanishResult = result && result.spanishTranslation

    if (spanishResult && langCode === langCodes.es) {
      return spanishResult
    } else {
      return result
    }
  })
}

function fetchContacts (queryParams) {
  return getKey('contacts').then(result => {
    return filter(result, queryParams)
  })
}

function fetchFormattedMenu () {
  return getKey('siteMap')
}

function fetchCounsellorCta () {
  const counsellorCtaNodeId = config.get('counsellorCta.nodeId')
  return getKey(counsellorCtaNodeId).then(data => {
    return Object.assign({}, data, {
      size: 'Large'
    })
  })
}

function fetchDocuments (queryParams) {
  return getKey('documents').then(data => {
    return filterAndSortDocuments(sanitizeDocumentParams(queryParams), data)
  })
}

function sanitizeDocumentParams (params) {
  const sanitizedParams = {
    type: 'all',
    program: 'all',
    activity: 'all',
    search: 'all',
    start: 'all',
    end: 'all',
    url: 'all'
  }
  mapValues(params, (value, key) => {
    if (key === 'start' || key === 'end') {
      if (parseInt(value, 10) || value === '0') {
        sanitizedParams[key] = parseInt(value, 10)
      } else {
        throw new TypeError('start / end params should be a number')
      }
    } else {
      value && (sanitizedParams[key] = value)
    }
  })
  return sanitizedParams
}

function filterAndSortDocuments (params, docs) {
  const filteredDocuments = filterDocuments(params, docs)
  const sortedDocuments = sortDocuments(params, filteredDocuments)

  const result = {
    count: sortedDocuments.length,
    items: params.start === 'all' || params.end === 'all'
      ? sortedDocuments
      : sortedDocuments.slice(params.start, params.end)
  }

  return result
}

/* eslint-disable complexity */
function filterDocuments (params, docs) {
  return docs.filter((doc, index) => {
    const matchesUrl = params.url === 'all' || doc.url === params.url
    const matchesActivitys = !params.documentActivity ||
      params.documentActivity === 'all' ||
      (!isEmpty(doc.activitys) && doc.activitys.includes(params.documentActivity))
    const matchesActivity = !params.activity ||
      params.activity === 'all' ||
      (!isEmpty(doc.activitys) && doc.activitys.includes(params.activity))
    const matchesProgram = !params.program ||
      params.program === 'all' ||
      (!isEmpty(doc.programs) && doc.programs.includes(params.program))
    const matchesType = !params.type || params.type === 'all' || doc.documentIdType === params.type
    const matchesDocumentType = !params.documentType || params.documentType === 'all' || doc.documentIdType === params.documentType
    return (
      matchesType &&
      matchesDocumentType &&
      matchesProgram &&
      matchesActivitys &&
      matchesActivity &&
      matchesUrl &&
      (!params.searchTerm ||
        params.searchTerm === 'all' ||
        doc.title.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
        (!isEmpty(doc.documentIdNumber) && doc.documentIdNumber.includes(params.searchTerm)))
    )
  })
}

function filterArticles (params, allArticles) {
  return allArticles.filter((article, index) => {
    const matchesUrl = !params.url || params.url === 'all' || article.url === params.url
    const matchesCategory = !params.articleCategory ||
      params.articleCategory === 'all' ||
      (!isEmpty(article.category) && article.category.includes(params.articleCategory))
    const matchesProgram = !params.program ||
      params.program === 'all' ||
      (!isEmpty(article.programs) && article.programs.includes(params.program))
    const matchesTitle = !params.searchTerm ||
      params.searchTerm === 'all' ||
      article.title.toLowerCase().includes(params.searchTerm.toLowerCase())
    const matchesType = !params.articleType || params.articleType === 'all' || article.type === params.articleType
    return matchesUrl && matchesCategory && matchesProgram && matchesTitle && matchesType
  })
}
/* eslint-enable complexity */

function sortDocuments (params, docs) {
  let sortOrder = ['asc']
  let sortItems
  if (params.sortBy === 'Title') {
    sortItems = ['title']
  } else if (params.sortBy === 'Number') {
    sortItems = ['documentIdNumber']
  } else if (params.sortBy === 'Last Updated') {
    sortItems = ['updated']
    sortOrder = ['desc']
  } else if (params.sortBy === 'Effective Date') {
    return sortDocumentsByDate(docs)
  } else {
    return docs
  }
  return orderBy(
    docs, [
      doc => {
        return typeof doc[sortItems] === 'string' ? doc[sortItems].toLowerCase() : doc[sortItems]
      }
    ],
    sortOrder
  )
}

function sortDocumentsByDate (docs) {
  const sortedDocs = orderBy(
    docs, [
      doc => {
        const files = filter(doc.files, file => {
          const date = moment(file.effectiveDate)
          return date.isValid() && date.isSameOrBefore(moment())
        })
        const latestFile = maxBy(files, 'effectiveDate')
        return latestFile ? latestFile.effectiveDate : ''
      }
    ], ['desc']
  )
  return sortedDocs
}

function fetchTaxonomys (queryParams) {
  return getKey('taxonomys').then(data => {
    let names = map(data, 'name')
    if (queryParams.names) {
      names = queryParams.names.split(',')
    }
    return data.filter(item => {
      return includes(names, item.name)
    })
  })
}

function fetchArticles (queryParams) {
  let sortOrder = 'asc'
  let sortField
  if (queryParams.sortBy === 'Title') {
    sortField = 'title'
  } else if (queryParams.sortBy === 'Last Updated') {
    sortField = 'updated'
    sortOrder = 'desc'
  } else if (queryParams.sortBy === 'Authored on Date') {
    sortField = 'created'
    sortOrder = 'desc'
  }

  return getKey('articles')
    .then(result => {
      return orderBy(result, sortField, sortOrder)
    })
    .then(results => {
      const filteredArticles = filterArticles(queryParams, results)
      return {
        items: queryParams.start === 'all' || queryParams.end === 'all'
          ? filteredArticles
          : filteredArticles.slice(queryParams.start, queryParams.end),
        count: filteredArticles.length
      }
    })
}

function fetchAnnouncements () {
  return getKey('announcements').then(result => {
    return result
  })
}

function fetchNodes () {
  return getKey('nodes')
}

function fetchDisaster () {
  return getKey('disaster')
}

function fetchMainMenu () {
  return getKey('mainMenu')
}

function fetchAllCourses(){
  return getKey('courses')
}

module.exports.fetchAnnouncements = fetchAnnouncements
module.exports.fetchArticles = fetchArticles
module.exports.fetchContacts = fetchContacts
module.exports.fetchCounsellorCta = fetchCounsellorCta
module.exports.fetchDocuments = fetchDocuments
module.exports.fetchFormattedMenu = fetchFormattedMenu
module.exports.fetchFormattedNode = fetchFormattedNode
module.exports.fetchNodes = fetchNodes
module.exports.fetchTaxonomys = fetchTaxonomys
module.exports.filterArticles = filterArticles
module.exports.sortDocumentsByDate = sortDocumentsByDate
module.exports.fetchDisaster = fetchDisaster
module.exports.fetchMainMenu = fetchMainMenu
module.exports.fetchAllCourses = fetchAllCourses;