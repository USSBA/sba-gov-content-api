'use strict'
const { fetchMainMenu } = require('../../service/drupal-eight.js')
console.log('G')
const MainMenuItemsController = {
  index: () => {
    console.log('H')
    return (new Promise((resolve, reject) => {
      const result = fetchMainMenu()
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
module.exports = MainMenuItemsController
