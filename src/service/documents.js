const s3CacheReader = require('../clients/s3-cache-reader.js')
const searchUtils = require('./search-utils.js')

const { filter, isEmpty, mapValues, maxBy, orderBy } = require('lodash')
const moment = require('moment')

function fetchDocuments (queryParams) {
  let params = sanitizeDocumentParams(queryParams)
  return s3CacheReader.getKey('documents').then(data => {
    let documents = filterDocuments(params, data)
    let sortedDocuments = sortDocuments(params, documents)
    return { count: sortedDocuments.length, items: searchUtils.paginateSearch(sortedDocuments, params.start, params.end) }
  })
}

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
    const matchesOffice = !params.office || params.office === 'all' || doc.office === Number(params.office)
    return (
      matchesType &&
      matchesDocumentType &&
      matchesProgram &&
      matchesActivitys &&
      matchesActivity &&
      matchesOffice &&
      matchesUrl &&
      (!params.searchTerm ||
        params.searchTerm === 'all' ||
        doc.title.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
        (!isEmpty(doc.documentIdNumber) && doc.documentIdNumber.includes(params.searchTerm)))
    )
  })
}

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

module.exports.fetchDocuments = fetchDocuments
module.exports.sortDocumentsByDate = sortDocumentsByDate
