/* eslint-env mocha */
let chai = require('chai')
let expect = chai.expect

const { getAuthors } = require('./authors.js')
const authors = require('./authors.json')

describe('authors', () => {
  it('should return json data', () => {
    const result = getAuthors()
    	const expected = authors
    	expect(result).to.deep.equal(expected)
  })
  it('should contain an array', () => {
    const result = getAuthors()
    expect(Array.isArray(result)).to.be.true
  })
  it('array should contain only numbers', () => {
    const expected = 'number'
    const result = getAuthors()
    authors.forEach(author => expect(typeof author).to.equal(expected))
  })
})
