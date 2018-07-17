'use strict'
let content = require('./content.js')
const { splitAsObject } = require("./util.js")

exports.handler = (event, context, callback) => {
  run(event)
    .then(result => {
      callback(null, result);
    })
    .catch(callback)
}

async function run(event) {
  let result = null;
  console.log(JSON.stringify(event))
  if (event && event.pathParameters) {
    let params = event.pathParameters;
    if (params.id) {
      let type = params.type;
      let { first: id, second: extension } = splitAsObject(params.id);
      result = await content.fetchContentById({ id, type, extension }, event.headers)
    }
    else {
      let { first: type, second: extension } = splitAsObject(params.type);
      result = await content.fetchContentByType({ type, extension })
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
