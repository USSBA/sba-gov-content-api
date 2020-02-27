/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()
const moment = require('moment')

const location = require('./location.js')
const eventSearch = require('./event-search.js')
const dynamoDbClient = require('../clients/dynamo-db-client.js')
const cloudsearch = require('../clients/cloudsearch.js')

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
        'end_datetime': ['2019-08-31T22:00:00Z'],
        'summary': ['This is the event summary section.'],
        'recurring_enddatetime': ['2019-07-20T00:00:00Z'],
        'start_datetime': ['2019-08-31T16:00:00Z'],
        'event_type': ['Online'],
        'timezone': ['Eastern time zone'],
        'organizer_phone_number': ['100-200-3000'],
        'organizer_name': ['Organizing Olivia'],
        'location_street_address': ['8 Market Place'],
        'name': ['Test Event (non-recurring)'],
        'geolocation': ['111111,222222']
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
    stubRunSearch = sinon.stub(cloudsearch, 'runSearch')
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
      const expectedParameter = 'start_datetime'
      builtQuery.should.contain(expectedParameter)

      const regexForDateCapture = /'(.*)'/
      const generatedDate = regexForDateCapture.exec(builtQuery)[1]
      moment(generatedDate).isValid().should.equal(true)
    })

    it('should format the startdatetime parameter given only a starting date', () => {
      const dateRangeOnlyWithStartDate = '2020-01-01T00:00:00Z'
      const expectedFormat = `start_datetime: ['${dateRangeOnlyWithStartDate}',}`
      const result = eventSearch.buildQuery(null, dateRangeOnlyWithStartDate)
      result.should.contain(expectedFormat)
    })

    it('should format the startdatetime parameter given a date range', () => {
      const startingDate = '2020-01-01T00:00:00Z'
      const endingDate = '2020-12-01T00:00:00Z'
      const dateRange = `${startingDate},${endingDate}`
      const expectedFormat = `start_datetime: ['${startingDate}','${endingDate}']`
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
      const dateRangeQueryString = `(range field=start_datetime ['${startingDate}','${endingDate}'])`

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
        query: `(and (range field=start_datetime ['${defaultDateRange}',}) (or description: 'test' name: 'test' summary: 'test'))`,
        return: '_all_fields',
        sort: 'start_datetime asc',
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
        query: `(and (range field=start_datetime ['${defaultDateRange}',}) host_office: '${officeId}')`,
        return: '_all_fields',
        sort: 'start_datetime asc',
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
        query: `(and (range field=start_datetime ['${defaultDateRange}',}) (or description: 'test' name: 'test' summary: 'test') host_office: '${officeId}')`,
        return: '_all_fields',
        sort: 'start_datetime asc',
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
        query: `start_datetime: ['${moment.utc().format()}',}`,
        queryParser: 'structured',
        return: '_all_fields',
        sort: 'start_datetime asc',
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
      let expected = {
        'found': 1,
        'start': 0,
        'hit': [{
          'id': 19164,
          'title': 'Test Event (non-recurring)',
          'type': 'event',
          'description': 'There will be an event. That is all.',
          'registrationUrl': {},
          'startDate': '2019-08-31T16:00:00Z',
          'endDate': '2019-08-31T22:00:00Z',
          'timezone': 'Eastern time zone',
          'locationType': 'Online',
          'location': {
            'name': 'Spark Baltimore',
            'address': '8 Market Place',
            'address2': {},
            'city': 'Baltimore',
            'zipcode': '21202',
            'state': 'MD',
            'latitude': '111111',
            'longitude': '222222'
          },
          'contact': {
            'name': 'Organizing Olivia',
            'email': 'organizingolivia@email.com',
            'phone': '100-200-3000'
          },
          'recurring': -1,
          'recurringType': {},
          'cost': {}
        }]
      }
      stubRunSearch.returns(mockCloudSearchResponseWithEvents)
      const result = await eventSearch.fetchEvents(params)
      result.should.eql(expected)
    })
  })

  describe('transformToDaishoEventObjectFormat', () => {
    it('should remap an object when all fields are present', () => {
      const items = [
        {
          id: '20351',
          fields: {
            name: ['My Test Event'],
            registration_website: ['https://myevent.com/register-here'],
            description: ['description text'],
            start_datetime: ['12345678'],
            end_datetime: ['987654321'],
            timezone: ['UTC'],
            event_type: ['in-person'],
            location_name: ['Washington Convention Center'],
            location_street_address: ['1600 Pennsylvania Ave'],
            location_street_address2: ['Suite 100'],
            location_city: ['Washington'],
            location_zipcode: ['12345'],
            location_state: ['DC'],
            geolocation: ['1111111111,2222222222'],
            organizer_name: ['J Edgar'],
            organizer_email: ['jedgar@hoover.gov'],
            organizer_phone_number: ['202-123-7771'],
            is_recurring: [0],
            recurring_interval: ['test'],
            event_cost: 123.45
          }
        }
      ]

      const expected = [{
        id: 20351,
        title: 'My Test Event',
        type: 'event',
        description: 'description text',
        registrationUrl: 'https://myevent.com/register-here',
        startDate: '12345678',
        endDate: '987654321',
        timezone: 'UTC',
        locationType: 'in-person',
        location: {
          name: 'Washington Convention Center',
          address: '1600 Pennsylvania Ave',
          address2: 'Suite 100',
          city: 'Washington',
          zipcode: '12345',
          state: 'DC',
          latitude: '1111111111',
          longitude: '2222222222'
        },
        contact: {
          name: 'J Edgar',
          email: 'jedgar@hoover.gov',
          phone: '202-123-7771'
        },
        recurring: -1,
        recurringType: 'test',
        cost: 123.45
      }]

      const result = eventSearch.transformToDaishoEventObjectFormat(items)
      result.should.eql(expected)
    })
    it('should remap an object with default values when any field is NOT present', () => {
      const items = [
        {
          id: '20351',
          fields: {}
        }
      ]

      const expected = [{
        id: 20351,
        title: {},
        type: 'event',
        description: {},
        registrationUrl: {},
        startDate: {},
        endDate: {},
        timezone: {},
        locationType: {},
        location: {
          name: {},
          address: {},
          address2: {},
          city: {},
          zipcode: {},
          state: {},
          latitude: {},
          longitude: {}
        },
        contact: { name: {}, email: {}, phone: {} },
        recurring: -1,
        recurringType: {},
        cost: {}
      }]

      const result = eventSearch.transformToDaishoEventObjectFormat(items)
      result.should.eql(expected)
    })
  })
})
