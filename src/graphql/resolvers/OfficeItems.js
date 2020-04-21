'use strict'
const { fetchOfficesRaw } = require('../../service/drupal-eight.js')
console.log('G')
const OfficeItemsController = {
  index: () => {
    console.log('H')
    return (new Promise((resolve, reject) => {
      const result = fetchOfficesRaw()
      resolve(result)
    }))
      .catch(error => {
        console.log('K', error)
        return {
          'error': error
        }
      })
  }
}
module.exports = OfficeItemsController
