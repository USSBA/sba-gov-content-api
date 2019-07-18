/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()
let eventSearch = require('./event-search.js')
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

describe('eventSearch', () => {
  // let stubGet
  let stubRunSearch
  before(() => {
    stubRunSearch = sinon.stub(eventSearch, 'runSearch')
  })
  afterEach(() => {
    stubRunSearch.reset()
  })
  after(() => {
    stubRunSearch.restore()
  })
  describe('buildQuery', () => {
    it('should format the query to search the fields, description, name and summary', () => {
      const expected = "(or description: 'test' name: 'test' summary: 'test')"
      const result = eventSearch.buildQuery('test')
      result.should.equal(expected)
    })
  })
  describe('buildParams', () => {
    it('should build a parameters object with a query', () => {
      const params = {
        q: 'test'
      }
      const expected = JSON.stringify({
        query: '(or description: \'test\' name: \'test\' summary: \'test\')',
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
