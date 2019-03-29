# SBA.gov Content Api

A microservice to service the Daisho-created Drupal8-sourced content 

## Environment Setup
See [development.md](development.md)

## Testing
1. Unit Tests: `npm run test` 
2. Integration Tests: `npm run test-int`  (requires aws-cli installation)

## Required Environment Variables
See [config.js](src/config.js) for details
1. CLOUDSEARCH_SEARCH_ENDPOINT
2. CLOUDSEARCH_OFFICE_ENDPOINT
3. CONTENT_BUCKET
4. ZIP_CODE_DYNAMODB_TABLE

## Configure Katana SuggestedRouteCard Data
To create, update or remove a suggested route, edit the file:
`src/service/suggested-routes.js`