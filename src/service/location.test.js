/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()
let expect = chai.expect

let location = require('./location.js')
let dynamoDbClient = require('../clients/dynamo-db-client.js')

let exampleDynamoDBResponse = {
  Items: [
    {
      city: 'Old Greenwich',
      zip: '06870',
      dst: 1,
      longitude: '-73.568040',
      timezone: -5,
      country: 'us',
      latitude: '41.033347',
      state: 'CT'
    },
    {
      city: 'Other Greenwich',
      zip: '06871',
      dst: 1,
      longitude: '-74.568040',
      timezone: -5,
      country: 'us',
      latitude: '40.033347',
      state: 'CT'
    }
  ],
  Count: 1,
  ScannedCount: 1
}

describe('# Location functions', () => {
  let dynamoDbClientQueryStub

  before(() => {
    dynamoDbClientQueryStub = sinon.stub(dynamoDbClient, 'queryDynamoDb')
  })

  afterEach(() => {
    dynamoDbClientQueryStub.reset()
  })

  after(() => {
    dynamoDbClientQueryStub.restore()
  })

  afterEach(() => {
    dynamoDbClientQueryStub.reset()
  })

  describe('computeLocation', () => {
    it('should return the lat and long from the first item that DynamoDB returns', async () => {
      dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
      let result = await location.computeLocation('11111')
      result.should.eql({ latitude: '41.033347', longitude: '-73.568040' })
    })

    it('should return null if the zip code is invalid', async () => {
      dynamoDbClientQueryStub.returns({
        Items: [],
        Count: 0,
        ScannedCount: 1
      })
      let result = await location.computeLocation('00000')
      expect(result).to.eql(null)
    })
  })
})
