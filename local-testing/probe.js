let data = require('./test-event.json')
let main = require('../src/index.js')
main.handler(data, null, function (err, data) {
  console.time('timer')
  console.error(err)
  console.log(JSON.parse(data.body))
  console.timeEnd('timer')
})
