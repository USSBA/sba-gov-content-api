const cloudsearch = require('../clients/cloudsearch.js')
const config = require('../config')
const endpoint = config.cloudSearch.articleEndpoint

function ArticleSearch () {}

ArticleSearch.prototype.buildQuery = function (query) {
  console.log("Build Quer!!!!", query) 
  const queryStatements = []
  let queryString = ''
  const fieldsToSearch = ['title', 'article_body', 'summary', 'url']
  for (const field of fieldsToSearch) {
    queryStatements.push(`${field}: '${cloudsearch.formatString(query)}'`)
  }
  if (queryStatements.length > 1) {
    queryString = `(or ${queryStatements.join(' ')})`
  }
  
  return queryString
}

ArticleSearch.prototype.buildFilters = function (params) {
  console.log("Build Filter!!!!", params)
  let filters = []
  let officeFilters = []
  let filterString = ''
  let officeFilterString = ''
  let programFilterString = ''
  let categoryFilterString = ''

  if (params.relatedOffice && !isNaN(Number(params.relatedOffice))) {
    officeFilters.push(`related_offices: '${params.relatedOffice}'`)
  }
  if (params.office && !isNaN(Number(params.office))) {
    officeFilters.push(`office: '${params.office}'`)
  }
  if (params.region) {
    officeFilters.push(`region: '${cloudsearch.formatString(params.region)}'`)
  }
  if (params.national && params.national === 'true') {
    officeFilters.push(`region: 'National'`)
  }

  if (officeFilters.length === 1) {
    officeFilterString = officeFilters[0]
  } else if (officeFilters.length > 1) {
    officeFilterString = officeFilters.join(' ')
  }

  if (params.program && params.program !== 'all') {
    programFilterString = `article_programs: '${cloudsearch.formatString(params.program)}'`
  }

  if (params.articleCategory && params.articleCategory !== 'all') {
    categoryFilterString = `article_category: '${cloudsearch.formatString(params.articleCategory)}'`
  }

  programFilterString.length > 0 && filters.push(programFilterString)
  categoryFilterString.length > 0 && filters.push(categoryFilterString)
  if (officeFilterString.length > 0 && filters.length === 0) {
    filterString += `(or ${officeFilterString})`
  } else if (officeFilterString.length === 0 && filters.length > 0) {
    filterString += `(and ${filters.join(' ')})`
  } else if (officeFilterString.length > 0 && filters.length > 0) {
    filterString += `(and (or ${officeFilterString}) ${filters.join(' ')})`
  }

  return filterString
}
  
ArticleSearch.prototype.setArticleSearchSort = function (params) {
  console.log("SearchSnort!!!!", params)
  let sortField = 'updated'
  let sortOrder = 'desc'

  if (params.sortBy) {
    if (params.sortBy === 'Title') {
      sortField = 'title'
    }
    if (params.sortBy === 'Authored on Date') {
      sortField = 'created'
    }
  }

  if (params.order && params.order === 'asc') {
    sortOrder = 'asc'
  }

  const result = `${sortField} ${sortOrder}`
  return result
}

ArticleSearch.prototype.transformToDaishoArticleObjectFormat = function (articles) {
  const remappedArticles = []
  for (let i = 0; i < articles.length; i++) {
    const { fields } = articles[i]
    const remappedArticle = {
      id: Number(articles[i].id),
      category: fields.article_category ? fields.article_category : [],
      office: fields.office ? Number(fields.office[0]) : {},
      programs: fields.article_programs ? fields.article_programs : [],
      region: fields.region ? fields.region : [],
      relatedOffices: fields.related_offices ? fields.related_offices.map(office => Number(office)) : [],
      summary: fields.summary ? fields.summary[0] : '',
      type: 'article',
      title: fields.title ? fields.title[0] : '',
      created: fields.created ? Number(fields.created[0]) : {},
      updated: fields.updated ? Number(fields.updated[0]) : {},
      url: fields.url ? fields.url[0] : ''
    }

    remappedArticles.push(remappedArticle)
  }
  return remappedArticles
}

ArticleSearch.prototype.fetchArticles = async function (queryParams) {
  const query = queryParams.searchTerm ? this.buildQuery(queryParams.searchTerm) : 'matchall'
  let cloudParams = {
    query: query, /* required */
    queryParser: 'structured',
    sort: this.setArticleSearchSort(queryParams),
    start: 0,
    return: '_all_fields'
  }
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
    items: this.transformToDaishoArticleObjectFormat(result.hits.hit),
    count: result.hits.found
  })
}

const _articleSearch = new ArticleSearch()
const { fetchArticles, transformToDaishoArticleObjectFormat, setArticleSearchSort, buildFilters, buildQuery } = _articleSearch

module.exports = {
  fetchArticles: fetchArticles.bind(_articleSearch),
  transformToDaishoArticleObjectFormat: transformToDaishoArticleObjectFormat.bind(_articleSearch),
  setArticleSearchSort: setArticleSearchSort.bind(_articleSearch),
  buildFilters: buildFilters.bind(_articleSearch),
  buildQuery: buildQuery.bind(_articleSearch)
}

