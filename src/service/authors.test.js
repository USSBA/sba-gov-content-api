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
    const expected = true
    const result = Array.isArray(getAuthors())
    expect(result).to.equal(expected)
  })
  it('array should contain only numbers', () => {
    const expected = 'number'
    authors.forEach(author => expect(typeof author).to.equal(expected))
  })
})
