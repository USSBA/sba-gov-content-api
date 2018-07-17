'use strict'
let content = require('./content.js')

exports.handler = (event, context, callback) => {
  run(event)
    .then(result => {
      callback(null, {
        statusCode: 200,
        body: "Hello World!"
      });
    })
    .catch(callback)
}

async function run(event) {
  let result = null;
  if (event && event.params) {
    let params = event.params.path;
    if (params.id) {
      result = await content.fetchContentById(params, event.headers)
    }
    else {
      result = await content.fetchContentByType(params)
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
