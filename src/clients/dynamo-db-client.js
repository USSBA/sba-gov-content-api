const aws = require('aws-sdk')

// moved to a separate file to make this easier to mock out (difficult because of the use of "new")
var documentClient = new aws.DynamoDB.DocumentClient({
  region: 'us-east-1'
})

async function queryDynamoDb (params) {
  return documentClient.query(params).promise()
}

module.exports.queryDynamoDb = queryDynamoDb
