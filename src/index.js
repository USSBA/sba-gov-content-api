'use strict'
let content = require('./content.js')
const { splitAsObject } = require("./util.js")

exports.handler = (event, context, callback) => {
  run(event)
    .then(result => {
      callback(null, result);
    })
    .catch(err => {
      console.error(err);
      callback(err)
    })
}

async function run(event) {
  let result = null;
  console.log(JSON.stringify(event))
  if (event && event.pathParameters) {
    let pathParams = event.pathParameters;
    let body = ""
    if (pathParams.id) {
      let type = pathParams.type;
      let { first: id, second: extension } = splitAsObject(pathParams.id);
      body = await content.fetchContentById({ id, type, extension }, event.headers || {})

    }
    else {
      let { first: type, second: extension } = splitAsObject(pathParams.type);
      body = await content.fetchContentByType({ type, extension }, event.queryStringParameters)
    }
    result = {
      statusCode: 200,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json"
      }
    }
  }
  else {
    result = {
      statusCode: 400,
      body: "Required parameters not found"
    }
  }
  return result;
}

// for testing
module.exports.run = run
