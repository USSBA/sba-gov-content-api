module.exports = {
  cloudSearch: {
    searchEndpoint: process.env.CLOUDSEARCH_SEARCH_ENDPOINT,
    officeEndpoint: process.env.CLOUDSEARCH_OFFICE_ENDPOINT
  },
  contentBucket: process.env.CONTENT_BUCKET,
  zipCodeDynamoDbTable: process.env.ZIP_CODE_DYNAMODB_TABLE,
  eventbriteApi: {
    token: process.env.EVENTBRITE_API_TOKEN,
    organizationId: process.env.EVENTBRITE_API_ORGANIZATION_ID
  }
}
