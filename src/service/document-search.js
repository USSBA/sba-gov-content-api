const moment = require('moment')
const cloudsearch = require('../clients/cloudsearch.js')
const config = require('../config')
const endpoint = config.cloudSearch.documentEndpoint

function DocumentSearch () {}

DocumentSearch.prototype.buildQuery = function (query) {
  const queryStatements = []
  let queryString = ''
  const fieldsToSearch = ['title', 'summary', 'url']

  for (const field of fieldsToSearch) {
    queryStatements.push(`${field}: '${cloudsearch.formatString(query)}'`)
  }

  if (queryStatements.length > 1) {
    queryString = `(or ${queryStatements.join(' ')})`
  }

  return queryString
}

DocumentSearch.prototype.buildFilters = function (params) {
  let filters = []
  let filterString = ''
  let officeFilterString = ''
  let programFilterString = ''
  let typeFilterString = ''
  let activityFilterString = ''

  if (params.office && !isNaN(Number(params.office))) {
    officeFilterString = `office: '${params.office}'`
  }

  if (params.program && params.program !== 'all') {
    programFilterString = `document_programs: '${cloudsearch.formatString(params.program)}'`
  }
  console.log('B--- ', params.documentType)
  if (params.documentType && params.documentType !== 'all') {
    console.log('C--- ', params.documentType)
    typeFilterString = `document_type: '${cloudsearch.formatString(params.documentType)}'`
  }

  if (params.documentActivity && params.documentActivity !== 'all') {
    activityFilterString = `document_activitys: '${cloudsearch.formatString(params.documentActivity)}'`
  }

  officeFilterString.length > 0 && filters.push(officeFilterString)
  programFilterString.length > 0 && filters.push(programFilterString)
  typeFilterString.length > 0 && filters.push(typeFilterString)
  activityFilterString.length > 0 && filters.push(activityFilterString)

  if (filters.length > 0) {
    filterString += `(and ${filters.join(' ')})`
  }

  return filterString
}

DocumentSearch.prototype.setDocumentSearchSort = function (params) {
  let sortField = 'updated'
  let sortOrder = 'desc'

  if (params.sortBy) {
    if (params.sortBy === 'Title') {
      sortField = 'title'
    }
    if (params.sortBy === 'Number') {
      sortField = 'document_id'
    }
    if (params.sortBy === 'Effective Date') {
      sortField = 'latest_file_effective_date'
    }
  }

  if (params.order && params.order === 'asc') {
    sortOrder = 'asc'
  }

  const sortRules = `${sortField} ${sortOrder}`
  return sortRules
}

DocumentSearch.prototype.getFilesDataIfPresent = function (docFile, latestFileEffectiveDate) {
  let file = {}

  if (docFile) {
    file.fileUrl = docFile[0]
  }
  if (latestFileEffectiveDate) {
    file.effectiveDate = moment(latestFileEffectiveDate[0]).utc().format('YYYY-MM-DD')
  }

  if (Object.keys(file).length > 0) {
    return [file]
  } else return []
}

DocumentSearch.prototype.transformToDaishoDocumentObjectFormat = function (documents) {
  const remappedDocuments = []

  for (let i = 0; i < documents.length; i++) {
    const { fields } = documents[i]
    const remappedDocument = {
      id: Number(documents[i].id),
      activitys: fields.document_activitys ? fields.document_activitys : {},
      documentIdNumber: fields.document_id ? fields.document_id[0] : {},
      documentIdType: fields.document_type ? fields.document_type[0] : '',
      files: this.getFilesDataIfPresent(fields.doc_file, fields.latest_file_effective_date),
      office: fields.office ? Number(fields.office[0]) : {},
      programs: fields.document_programs ? fields.document_programs : [],
      removeDownloadButton: fields.remove_download_button ? Number(fields.remove_download_button[0]) === 1 : {},
      summary: fields.summary ? fields.summary[0] : '',
      title: fields.title ? fields.title[0] : '',
      type: 'document',
      created: fields.created ? Number(fields.created[0]) : {},
      updated: fields.updated ? Number(fields.updated[0]) : {},
      url: fields.url ? fields.url[0] : ''
    }
    console.log('A-- ', i, ' ', fields)
    remappedDocuments.push(remappedDocument)
  }

  return remappedDocuments
}

DocumentSearch.prototype.fetchDocuments = async function (queryParams) {
  const query = (queryParams && queryParams.searchTerm) ? this.buildQuery(queryParams.searchTerm) : 'matchall'
  let cloudParams = {
    query: query, /* required */
    queryParser: 'structured',
    sort: this.setDocumentSearchSort(queryParams),
    start: 0,
    return: '_all_fields'
  }
  console.log('A-- ', queryParams)
  const filters = this.buildFilters(queryParams)
  if (filters.length > 0) {
    cloudParams.filterQuery = filters
  }

  const { end, start } = queryParams
  if (start) {
    cloudParams.start = start
  }

  if (end) {
    cloudParams.size = end - cloudParams.start
  }

  const result = await cloudsearch.runSearch(cloudParams, endpoint)

  return Object.assign({}, {
    items: this.transformToDaishoDocumentObjectFormat(result.hits.hit),
    count: result.hits.found
  })
}

const _documentSearch = new DocumentSearch()
const { fetchDocuments, transformToDaishoDocumentObjectFormat, setDocumentSearchSort, buildFilters, buildQuery, getFilesDataIfPresent } = _documentSearch

module.exports = {
  fetchDocuments: fetchDocuments.bind(_documentSearch),
  transformToDaishoDocumentObjectFormat: transformToDaishoDocumentObjectFormat.bind(_documentSearch),
  setDocumentSearchSort: setDocumentSearchSort.bind(_documentSearch),
  buildFilters: buildFilters.bind(_documentSearch),
  buildQuery: buildQuery.bind(_documentSearch),
  getFilesDataIfPresent: getFilesDataIfPresent.bind(_documentSearch)
}
