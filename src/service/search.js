const config = require('../config')
const aws = require('aws-sdk')
const csd = new aws.CloudSearchDomain({
  endpoint: config.cloudSearch.searchEndpoint,
  region: 'us-east-1',
  apiVersions: '2013-01-01'
})

async function search (req, res) {
  const { term, pageSize, start } = req
  const fixedTerm = term.replace(/%20/g, ' ')
  const params = {
    query: fixedTerm /* required */,
    // cursor: 'STRING_VALUE',
    // expr: 'STRING_VALUE',
    // facet: 'STRING_VALUE',
    // filterQuery: 'STRING_VALUE',
    // highlight: 'STRING_VALUE',
    // partial: true || false,
    // queryOptions: 'STRING_VALUE',
    // queryParser: 'simple | structured | lucene | dismax',
    // return: 'STRING_VALUE',
    size: pageSize,
    // sort: 'STRING_VALUE',
    start: start
  }

  try {
    let result = await csd.search(params).promise()
    return result
  } catch (e) {
    console.log('Error retrieving results from cloudsearch for ' + JSON.stringify(params), e)
    throw new Error('Error retrieving results from cloudsearch')
  }
}

module.exports.search = runSearch
