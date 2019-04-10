let config = require('../config')
let AWS = require('aws-sdk')
var sthreeClient = new AWS.S3({
  apiVersion: '2006-03-01'
})

function getKey (key) {
  if (key) {
    const params = {
      Bucket: config.contentBucket,
      Key: `${key}.json`
    }
    return sthreeClient
      .getObject(params)
      .promise()
      .then(result => {
        // console.log('result', result)
        const resultString = result.Body.toString()
        return JSON.parse(resultString)
      })
      .catch(error => {
        console.error(`Failed to get from S3 for ${JSON.stringify(params)}`, error)
      })
  } else {
    console.error(`Unable to get key from S3: ${key}`)
    return Promise.resolve(null)
  }
}

module.exports.getKey = getKey
