/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()
const moment = require('moment')

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
    it('should create the startdatetime parameter and generate date if not given a date range', () => {
      const builtQuery = eventSearch.buildQuery(null, null)
      const expectedParameter = 'startdatetime'
      builtQuery.should.contain(expectedParameter)

      const regexForDateCapture = /'(.*)'/
      const generatedDate = regexForDateCapture.exec(builtQuery)[1]
      moment(generatedDate).isValid().should.equal(true)
    })

    it('should format the startdatetime parameter given only a starting date', () => {
      const dateRangeOnlyWithStartDate = '2020-01-01T00:00:00Z'
      const expectedFormat = `startdatetime: ['${dateRangeOnlyWithStartDate}',}`
      const result = eventSearch.buildQuery(null, dateRangeOnlyWithStartDate)
      result.should.contain(expectedFormat)
    })

    it('should format the startdatetime parameter given a date range', () => {
      const startingDate = '2020-01-01T00:00:00Z'
      const endingDate = '2020-12-01T00:00:00Z'
      const dateRange = `${startingDate},${endingDate}`
      const expectedFormat = `startdatetime: ['${startingDate}','${endingDate}']`
      const result = eventSearch.buildQuery(null, dateRange)
      result.should.contain(expectedFormat)
    })

    it('should format the query to search the fields, description, name and summary', () => {
      const expected = "(or description: 'test' name: 'test' summary: 'test')"
      const result = eventSearch.buildQuery('test')
      result.should.contain(expected)
    })

    it('should format the compound query given both a date range and keyword', () => {
      const startingDate = '2020-01-01T00:00:00Z'
      const endingDate = '2020-12-01T00:00:00Z'
      const dateRangeString = `${startingDate},${endingDate}`
      const dateRangeQueryString = `(range field=startdatetime ['${startingDate}','${endingDate}'])`

      const keyword = 'test'
      const keywordQueryString = `(or description: '${keyword}' name: '${keyword}' summary: '${keyword}')`

      const expectedFormat = `(and ${dateRangeQueryString} ${keywordQueryString})`
      const result = eventSearch.buildQuery('test', dateRangeString)
      result.should.contain(expectedFormat)
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

    it('should enter the office into the params for a cloudsearch query', async () => {
      const defaultDateRange = '2020-01-01T00:00:00Z'
      const officeId = Math.floor((Math.random() * 10000) + 1)
      const params = {
        office: officeId,
        dateRange: defaultDateRange
      }
      const expected = JSON.stringify({
        query: `(and (range field=startdatetime ['${defaultDateRange}',}) hostoffice: '${officeId}')`,
        return: '_all_fields',
        sort: 'startdatetime asc',
        queryParser: 'structured',
        size: 20,
        start: 0
      })
      const result = JSON.stringify(eventSearch.buildParams(params, {}))
      result.should.equal(expected)
    })

    it('should enter the office and query search phrase into the params for a cloudsearch query', async () => {
      const defaultDateRange = '2020-01-01T00:00:00Z'
      const officeId = Math.floor((Math.random() * 10000) + 1)
      const params = {
        q: 'test',
        office: officeId,
        dateRange: defaultDateRange
      }
      const expected = JSON.stringify({
        query: `(and (range field=startdatetime ['${defaultDateRange}',}) (or description: 'test' name: 'test' summary: 'test') hostoffice: '${officeId}')`,
        return: '_all_fields',
        sort: 'startdatetime asc',
        queryParser: 'structured',
        size: 20,
        start: 0
      })
      const result = JSON.stringify(eventSearch.buildParams(params, {}))
      result.should.equal(expected)
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
