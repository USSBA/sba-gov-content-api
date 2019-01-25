module.exports = {
  cloudSearch: {
    searchEndpoint: process.env.CLOUDSEARCH_SEARCH_ENDPOINT,
    officeEndpoint: process.env.CLOUDSEARCH_OFFICE_ENDPOINT
  },
  contentBucket: process.env.CONTENT_BUCKET,
  zipCodeDynamoDbTable: process.env.ZIP_CODE_DYNAMODB_TABLE,
  event: {
    eventApiToken: process.env.EVENT_API_TOKEN,
    eventApiOrganizationId: process.env.EVENT_API_ORGANIZATION_ID
  }
}
