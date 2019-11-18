const aws = require('aws-sdk')

function formatString (string) {
  let result = decodeURI(string)
  // cloudsearch requires us to escape backslashes and quotes
  result = result.replace(/\\/g, '\\\\')
  result = result.replace(/'/g, "\\'")
  return result
}

async function runSearch (params, endpoint) {
  const csd = new aws.CloudSearchDomain({
    endpoint: endpoint,
    region: 'us-east-1',
    apiVersions: '2013-01-01'
  })
  const result = await csd.search(params).promise()
  return result
}

module.exports.formatString = formatString
module.exports.runSearch = runSearch
