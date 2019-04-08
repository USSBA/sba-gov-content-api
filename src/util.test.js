/* eslint-env mocha , eslint no-unused-expressions: 0 */
let chai = require('chai')
chai.should()

let util = require('./util')

describe('# util', () => {
  describe('splitAsObject', () => {
    it('should split it properly', async() => {
      let result = util.splitAsObject('search/mainMenu.json')
      result.should.eql({ first: 'mainMenu', second: 'json' })
    })
  })
})
