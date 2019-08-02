/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()
const moment = require('moment-timezone')

const location = require('./location.js')
const eventSearch = require('./event-search.js')
const dynamoDbClient = require('../clients/dynamo-db-client.js')

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

let mockCloudSearchResponseWithEvents = {
  status: {
    timems: 31,
    rid: '//mU9b4s+C0KlCOm'
  },
  hits: {
    'found': 1,
    'start': 0,
    'hit': [{
      'id': '19164',
      'fields': {
        'location_city': ['Baltimore'],
        'location_state': ['MD'],
        'location_zipcode': ['21202'],
        'location_name': ['Spark Baltimore'],
        'organizer_email': ['organizingolivia@email.com'],
        'language': ['en'],
        'description': ['There will be an event. That is all.'],
        'enddatetime': ['2019-08-31T22:00:00Z'],
        'summary': ['This is the event summary section.'],
        'recurring_enddatetime': ['2019-07-20T00:00:00Z'],
        'startdatetime': ['2019-08-31T16:00:00Z'],
        'event_type': ['Online'],
        'timezone': ['Eastern time zone'],
        'organizer_phone_number': ['100-200-3000'],
        'organizer_name': ['Organizing Olivia'],
        'location_street_address': ['8 Market Place'],
        'name': ['Test Event (non-recurring)']
      }
    }]
  }
}

let exampleCloudSearchEmptyResponse = {
  status: { timems: 31, rid: '//mU9b4s+C0KlCOm' },
  hits: { found: 0, start: 0, hit: [] }
}

describe('eventSearch', () => {
  // let stubGet
  let dynamoDbClientQueryStub

  let stubRunSearch
  before(() => {
    stubRunSearch = sinon.stub(eventSearch, 'runSearch')
    dynamoDbClientQueryStub = sinon.stub(dynamoDbClient, 'queryDynamoDb')
  })
  afterEach(() => {
    stubRunSearch.reset()
    dynamoDbClientQueryStub.reset()
  })
  after(() => {
    stubRunSearch.restore()
    dynamoDbClientQueryStub.restore()
  })
  describe('buildQuery', () => {
    it('should format the query to search the fields, description, name and summary', () => {
      const expected = "(or description: 'test' name: 'test' summary: 'test')"
      const result = eventSearch.buildQuery('test')
      result.should.contain(expected)
    })
  })
  describe('buildParams', () => {
    it('should build a parameters object with a query', () => {
      const defaultDateRange = '2020-01-01T00:00:00Z'
      const params = {
        q: 'test',
        dateRange: defaultDateRange
      }
      const expected = JSON.stringify({
        query: `(and (range field=startdatetime ['${defaultDateRange}',}) (or description: 'test' name: 'test' summary: 'test'))`,
        return: '_all_fields',
        sort: 'startdatetime asc',
        queryParser: 'structured',
        size: 20,
        start: 0
      })
      const result = JSON.stringify(eventSearch.buildParams(params, {}))
      result.should.equal(expected)
    })
    it('should build a parameters object with a date', () => {
      const paramsWithNoQuery = {}
      const { query } = eventSearch.buildParams(paramsWithNoQuery, {})
      const result = query.indexOf('startdatetime') !== -1
      result.should.equal(true)
    })
    it('should enter the lat and long into the params for cloudsearch query', async () => {
      dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
      stubRunSearch.returns(exampleCloudSearchEmptyResponse)
      const distance = Math.floor((Math.random() * 200) + 1)
      let result = await eventSearch.fetchEvents({ address: '06870', distance: distance })
      const { latitude, longitude } = exampleDynamoDBResponse['Items'][0]
      const { northeast, southwest } = location.computeBoundingBoxWithMiles(latitude, longitude, distance)
      const filterQueryParamsString = `geolocation:['${northeast.latitude},${southwest.longitude}','${southwest.latitude},${northeast.longitude}']`
      stubRunSearch.calledWith({
        query: `startdatetime: ['${moment.utc().format()}',}`,
        queryParser: 'structured',
        return: '_all_fields',
        sort: 'startdatetime asc',
        size: 20,
        start: 0,
        filterQuery: filterQueryParamsString
      }).should.be.true
      result.hit.should.eql(exampleCloudSearchEmptyResponse.hits.hit)
      result.found.should.eql(exampleCloudSearchEmptyResponse.hits.found)
      result.start.should.eql(exampleCloudSearchEmptyResponse.hits.start)
    })
  })
  describe('fetchEvents', () => {
    it('should fetch an event', async () => {
      const params = {
        q: 'test'
      }
      const expected = JSON.stringify(mockCloudSearchResponseWithEvents.hits)
      stubRunSearch.returns(mockCloudSearchResponseWithEvents)
      const result = JSON.stringify(await eventSearch.fetchEvents(params))
      result.should.equal(expected)
    })
  })
})
