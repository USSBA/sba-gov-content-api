module.exports = {
  cloudSearch: {
    searchEndpoint: process.env.CLOUDSEARCH_SEARCH_ENDPOINT,
    officeEndpoint: process.env.CLOUDSEARCH_OFFICE_ENDPOINT
    // searchEndpoint: 'doc-mint-hdgvyg66mwvfnu46tzaszesh5u.us-east-1.cloudsearch.amazonaws.com',
    // officeEndpoint: 'doc-mint-offices-mjhazqnua7k5nqkxojddfhkrw4.us-east-1.cloudsearch.amazonaws.com'
  },
  contentBucket: process.env.CONTENT_BUCKET,
  zipCodeDynamoDbTable: process.env.ZIP_CODE_DYNAMODB_TABLE,
  // contentBucket: 'kevin-content-sba-gov',
  // zipCodeDynamoDbTable: 'ZipCodesLower',
  eventsApi: {
    hostname: process.env.EVENTS_HOSTNAME,
    endpoint: process.env.EVENTS_API_ENDPOINT,
    countEndpoint: process.env.EVENTS_API_COUNT_ENDPOINT
  }
}