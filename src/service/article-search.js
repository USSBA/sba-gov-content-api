const cloudsearch = require('../clients/cloudsearch.js')
const config = require('../config')
const endpoint = config.cloudSearch.articleEndpoint

function ArticleSearch () {
  this.buildQuery = function (query) {
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

  this.buildFilters = function (params) {
    let filters = []
    let officeFilters = []
    let filterString = ''
    let officeFilterString = ''
    let programFilterString = ''
    let categoryFilterString = ''

    if (params.relatedOffice && !isNaN(Number(params.relatedOffice))) {
      officeFilters.push(`(or related_offices: '${params.relatedOffice}')`)
    }
    if (params.office && !isNaN(Number(params.office))) {
      officeFilters.push(`(or office: '${params.office}')`)
    }
    if (params.region) {
      officeFilters.push(`(or region: '${cloudsearch.formatString(params.region)}')`)
    }
    if (params.national && params.national === 'true') {
      officeFilters.push(`(or region: 'National')`)
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
    if (officeFilterString.length > 0 || filters.length > 0) {
      filterString += `(and ${officeFilterString} ${filters.join(' ')})`
    }

    return filterString
  }

  this.setArticleSearchSort = function (params) {
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

  this.transformToDaishoArticleObjectFormat = function (articles) {
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

  this.fetchArticles = async function (queryParams) {
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

  return {
    buildQuery: this.buildQuery,
    buildFilters: this.buildFilters,
    setArticleSearchSort: this.setArticleSearchSort,
    fetchArticles: this.fetchArticles,
    transformToDaishoArticleObjectFormat: this.transformToDaishoArticleObjectFormat
  }
}

module.exports = ArticleSearch()
