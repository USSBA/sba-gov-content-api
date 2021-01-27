'use strict'
let content = require('./content.js')
const { splitAsObject } = require('./util.js')
const json2csv = require('json2csv').parse

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
    const { queryStringParameters, pathParameters } = event
    let fetchResult = ''
    let foundExtension
    if (queryStringParameters && queryStringParameters.id) {
      let { first: type, second: extension } = splitAsObject(pathParameters.type)
      fetchResult = await content.fetchContentById({ id: queryStringParameters.id, type, extension }, event.headers || {})
      foundExtension = extension
    } else {
      let { first: type, second: extension } = splitAsObject(pathParameters.type)
      fetchResult = await content.fetchContentByType({ type, extension }, event.queryStringParameters || {})
      foundExtension = extension
    }
    let resultBody
    let returnType = 'application/json'
    if (foundExtension) {
      if (foundExtension === 'csv') {
        resultBody = createCsvFromJson(fetchResult.body)
        returnType = 'text/csv'
      } else if (foundExtension === 'json') {
        resultBody = JSON.stringify(fetchResult.body)
        returnType = 'application/json'
      } else {
        console.log('Extension mismatch')
      }
    }
    result = {
      statusCode: fetchResult.statusCode,
      body: resultBody,
      headers: {
        'Content-Type': returnType
        'Access-Control-Allow-Headers' : "*",
        'Access-Control-Allow-Methods": "GET"

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

function createCsvFromJson (jsonData) {
  const fields = Object.keys(jsonData[0])
  return json2csv(jsonData, { fields })
}

// for testing
module.exports.run = run
