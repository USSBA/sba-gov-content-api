module.exports = {
  cloudSearch: {
    searchEndpoint: process.env.CLOUDSEARCH_SEARCH_ENDPOINT,
    officeEndpoint: process.env.CLOUDSEARCH_OFFICE_ENDPOINT,
    eventEndpoint: process.env.CLOUDSEARCH_EVENT_ENDPOINT,
    articleEndpoint: process.env.CLOUDSEARCH_ARTICLE_ENDPOINT
  },
  contentBucket: process.env.CONTENT_BUCKET,
  zipCodeDynamoDbTable: process.env.ZIP_CODE_DYNAMODB_TABLE,
  eventsApi: {
    hostname: process.env.EVENTS_HOSTNAME,
    endpoint: process.env.EVENTS_API_ENDPOINT,
    countEndpoint: process.env.EVENTS_API_COUNT_ENDPOINT,
    // TODO: remove this feature flag function when new events backend is ready to be enabled
    getBackendSourceToggle: () => process.env.EVENTS_BACKEND_SOURCE_DRUPAL_8_TOGGLE
  }
}
