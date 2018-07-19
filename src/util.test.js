/* eslint-env mocha , eslint no-unused-expressions: 0 */
let sinon = require('sinon')
let chai = require('chai')
chai.should()
let expect = chai.expect

let util = require("./util")


describe('# util', () => {

    describe('splitAsObject', () => {
        it('should split it properly', async() => {
            let result = util.splitAsObject("mainMenu.json")
            result.should.eql({ first: 'mainMenu', second: 'json' })
        })

    })

})
