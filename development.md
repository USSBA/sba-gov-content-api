# Content API development guide

## How do I push to my environment?
Use `./push-tag.sh <environment name>`

## Environment Setup
1. Install [NVM](https://github.com/creationix/nvm)
      * NVM is our node version manager of choice. Please follow the steps detailed on their repo.
1. Download and use the Node version specified in the [.nvmrc](https://github.com/USSBA/sba-gov-katana/blob/master/.nvmrc#L1)
   * Normally you would provide a version number to these commands, but in this project, the appropriate version is supplied to them by the .nvmrc
    ```sh
    nvm install && nvm use
    ```
1. Setup AWS credentials in ~/.aws according to http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

## Production Build Process
1. `npm install`
1. `npm run lint`
1. `npm test` to execute the tests
1. `./push-tag.sh <environment name>` to push to an environment

## Local Development Process 
1. `npm install` to install the dependencies
1. Create a test file: `cp local-testing/test-event.json_template local-testing/test-event.json`
1. Update `local-testing/test-event.json`
1. `npm run test-local` 
#### *TODO* replace ^^^^ with SAM LOCAL (See https://github.com/awslabs/aws-sam-cli)

## Required Environment Variables
See [config.js](src/config.js) for details
1. CLOUDSEARCH_SEARCH_ENDPOINT
2. CLOUDSEARCH_OFFICE_ENDPOINT
3. CONTENT_BUCKET
4. ZIP_CODE_DYNAMODB_TABLE
5. EVENTS_API_ENDPOINT
6. EVENTS_HOSTNAME

## Configure Katana SuggestedRouteCard Data
To create, update or remove a suggested route, edit the file:
`src/service/suggested-routes.js`