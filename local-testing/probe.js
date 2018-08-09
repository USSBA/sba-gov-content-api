let data = require('./test-event.json')
let main = require('../src/index.js')
main.handler(data, null, function(err, data){
    console.error(err);
    console.log(data)
})