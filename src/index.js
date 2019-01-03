'use strict'
let content = require('./content.js')
const { splitAsObject } = require('./util.js')

exports.handler = (event, context, callback) => {
  run(event)
    .then(result => {
      callback(null, result)
    })
    .catch(err => {
      console.error(err)
      callback(err)
    })
}

async function run (event) {
  let result = null
  console.log(JSON.stringify(event))
  if (event && event.pathParameters) {
    let pathParams = event.pathParameters
    let fetchResult = ''
    let foundExtension
    if (pathParams.id) {
      let type = pathParams.type
      let{ first: id, second: extension } = splitAsObject(pathParams.id)
      fetchResult = await content.fetchContentById({ id, type, extension }, event.headers || {})
      foundExtension = extension
    } else {
      let { first: type, second: extension } = splitAsObject(pathParams.type)
      fetchResult = await content.fetchContentByType({ type, extension }, event.queryStringParameters || {})
      foundExtension = extension
    }
    let returnType = "application/json"
    if (foundExtension === "csv") {
      returnType = "text/csv"
    }
    result = {
      statusCode: fetchResult.statusCode,
      body: JSON.stringify(fetchResult.body),
      headers: {
        'Content-Type': returnType
      }
    }
  } else {
    result = {
      statusCode: 400,
      body: 'Required parameters not found'
    }
  }
  return result
}

// for testing
module.exports.run = run
