# Content API development guide


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
1. ./push-tag.sh <environment name>` to push to an environment (valid values are: production, staging, demo, mint, int-*)

## Local Development Process 
1. `npm install` to install the dependencies
1. Create a test file: `cp local-testing/test-event.json_template local-testing/test-event.json`
1. Update `local-testing/test-event.json`
1. `node local-testing/probe.js` 
#### *TODO* replace ^^^^ with SAM LOCAL (See https://github.com/awslabs/aws-sam-cli)

## Required Environment Variables
See the [readme](README.md)