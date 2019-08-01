/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

let eventClient = require('../clients/event-client.js')
let sinon = require('sinon')
let chai = require('chai')
chai.should()

const events = require('./events')
const mockD7Response1 = require('./events.test.json')
const expectedEventsData1 = require('./events.output.test.json')
const config = require('../config.js')

function makeArray (n) {
  return new Array(n).fill(0)
}

// TODO: remove this describe block when feature flag, getBackendSourceToggle, for events backend is removed
describe('Event Service for D7', () => {
  let eventClientStub, eventClientCountStub, getBackendSourceToggleStub, clock, todayDateString, tomorrowDateString, sevenDaysFromNowDateString, thirtyDaysFromNowDateString

  before(() => {
    clock = sinon.useFakeTimers(new Date(2016, 2, 15).getTime())
    todayDateString = '2016-03-15'
    tomorrowDateString = '2016-03-16'
    sevenDaysFromNowDateString = '2016-03-22'
    thirtyDaysFromNowDateString = '2016-04-14'
    eventClientStub = sinon.stub(eventClient, 'getEvents')
    eventClientCountStub = sinon.stub(eventClient, 'getEventCount')
    getBackendSourceToggleStub = sinon.stub(config.eventsApi, 'getBackendSourceToggle')
  })

  beforeEach(() => {
    eventClientCountStub.returns([1, 2, 3])
    getBackendSourceToggleStub.returns('false')
  })

  afterEach(() => {
    eventClientCountStub.reset()
    eventClientStub.reset()
    getBackendSourceToggleStub.reset()
  })

  after(() => {
    clock.restore()
    eventClientStub.restore()
    eventClientCountStub.restore()
    getBackendSourceToggleStub.restore()
  })

  describe('fetchEventById', () => {
    it('should fetch and map data for a single event', async() => {
      eventClientStub.returns(mockD7Response1)
      const result = await events.fetchEventById(mockD7Response1[0].nid)
      result.should.eql(expectedEventsData1.items[0])
    })
  })

  describe('mapD7EventDataToBetterSchema', () => {
    it('should properly decode event titles with special characters', () => {
      eventClientStub.returns(mockD7Response1[10])
      const result = events.mapD7EventDataToBetterSchema(mockD7Response1[10]).title
      result.should.eql(expectedEventsData1.items[10].title)
    })
  })

  describe('fetchEvents', () => {
    it('should fetch and map data when no query params are presented', async() => {
      eventClientStub.returns(mockD7Response1)
      const results = await events.fetchEvents(null)
      results.should.eql(expectedEventsData1)
    })
  })

  describe('fetchTotalLength', () => {
    it('should fetch the total number of matching records (multiple pages)', async() => {
      eventClientCountStub.reset()
      eventClientCountStub.withArgs({q: 'test', offset: 0}).returns(makeArray(1000))
      eventClientCountStub.withArgs({q: 'test', offset: 1000}).returns(makeArray(1000))
      eventClientCountStub.withArgs({q: 'test', offset: 2000}).returns(makeArray(700))
      const results = await events.fetchTotalLength({q: 'test'})
      results.should.eql(2700)
    })

    it('should fetch the total number of matching records after only one page', async() => {
      eventClientCountStub.reset()
      eventClientCountStub.withArgs({q: 'test', offset: 0}).returns(makeArray(42))
      const results = await events.fetchTotalLength({q: 'test'})
      results.should.eql(42)
    })

    it('should return the maximum number of records if the actual total exceeds the maximum', async() => {
      eventClientCountStub.reset()
      eventClientCountStub.returns(makeArray(1000))
      const results = await events.fetchTotalLength({q: 'test'})
      results.should.eql(10000)
    })
  })

  describe('translateQueryParamsForD7', () => {
    it('should properly translate query params for the title and body search', async() => {
      eventClientStub.returns(mockD7Response1)
      let searchParam = 'test'
      await events.fetchEvents({ q: searchParam })
      eventClientStub.calledOnceWith({ title: searchParam, body_value: searchParam }).should.be.true
    })

    it('should properly translate query params for the title and body search with pagination', async() => {
      eventClientStub.returns(mockD7Response1)
      let searchParam = 'test'
      await events.fetchEvents({ q: searchParam, start: 1000 })
      eventClientStub.calledOnceWith({ title: searchParam, body_value: searchParam, offset: 1000 }).should.be.true
    })

    it('should properly translate query params for a zip code', async() => {
      eventClientStub.returns(mockD7Response1)
      let zip = '21113' // note: this is a string, not a number
      await events.fetchEvents({ address: zip })
      eventClientStub.calledOnceWith({ postal_code: zip }).should.be.true
    })

    it('should properly translate query params for a zip code and distance', async() => {
      eventClientStub.returns(mockD7Response1)
      let zip = '21113' // note: this is a string, not a number
      await events.fetchEvents({ address: zip, distance: 8 })
      eventClientStub.calledOnceWith({ 'distance[postal_code]': zip, 'distance[search_distance]': 8 }).should.be.true
    })

    it('should properly translate query params for today', async() => {
      eventClientStub.returns(mockD7Response1)
      await events.fetchEvents({ dateRange: 'today' })
      eventClientStub.calledOnceWith({ 'field_event_date_value[value][date]': todayDateString, 'field_event_date_value2[value][date]': todayDateString }).should.be.true
    })

    it('should properly translate query params for tomorrow', async() => {
      eventClientStub.returns(mockD7Response1)
      await events.fetchEvents({ dateRange: 'tomorrow' })
      eventClientStub.calledOnceWith({ 'field_event_date_value[value][date]': tomorrowDateString, 'field_event_date_value2[value][date]': tomorrowDateString }).should.be.true
    })

    it('should properly translate query params for 7days', async() => {
      eventClientStub.returns(mockD7Response1)
      await events.fetchEvents({ dateRange: '7days' })
      eventClientStub.calledOnceWith({ 'field_event_date_value[value][date]': todayDateString, 'field_event_date_value2[value][date]': sevenDaysFromNowDateString }).should.be.true
    })

    it('should properly translate query params for 30days', async() => {
      eventClientStub.returns(mockD7Response1)
      await events.fetchEvents({ dateRange: '30days' })
      eventClientStub.calledOnceWith({ 'field_event_date_value[value][date]': todayDateString, 'field_event_date_value2[value][date]': thirtyDaysFromNowDateString }).should.be.true
    })

    it('should properly translate a mix of query params', async() => {
      eventClientStub.returns(mockD7Response1)
      let searchParam = 'test'
      await events.fetchEvents({ q: searchParam, start: 1000, dateRange: 'today' })
      eventClientStub.calledOnceWith({ title: searchParam, body_value: searchParam, offset: 1000, 'field_event_date_value[value][date]': todayDateString, 'field_event_date_value2[value][date]': todayDateString }).should.be.true
    })
  })
})

/* eslint-enable no-unused-expressions */
