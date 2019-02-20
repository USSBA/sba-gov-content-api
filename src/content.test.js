/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()
let expect = chai.expect

let contentHandler
let events = require('./service/events.js')
const HttpStatus = require('http-status-codes')

describe('# Content Handler', () => {
  let eventStub

  before(() => {
    eventStub = sinon.stub(events, 'fetchEventById')
    contentHandler = require('./content.js') // this is a small workaround for the way the content handler imports service modules
  })

  afterEach(() => {
    eventStub.reset()
  })

  after(() => {
    eventStub.restore()
  })

  describe('fetchContentById', () => {
    it('should respond with event data when a valid id is given in the path', async () => {
      let data = { title: 'thisisatitle' }
      eventStub.withArgs(1).returns(data)
      let result = await contentHandler.fetchContentById({ type: 'event', id: 1 })
      let expected = {statusCode: HttpStatus.OK, body: data}
      expect(result).to.deep.equal(expected)
    })

    it('should respond with a 404 when an invalid id is given in the path', async () => {
      eventStub.returns(null)
      let result = await contentHandler.fetchContentById({ type: 'event', id: 1 })
      let expected = {statusCode: HttpStatus.NOT_FOUND, body: 'Unable to find event with id 1'}
      expect(result).to.deep.equal(expected)
    })
  })
})

/* eslint-enable no-unused-expressions */
