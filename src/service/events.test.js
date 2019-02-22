/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

let eventClient = require('../clients/event-client.js')
let sinon = require('sinon')
let chai = require('chai')
chai.should()

// const { fn as momentPrototype } = require("moment")
const events = require('./events')
const mockD7Response1 = require('./events.test.json')
const expectedEventsData1 = require('./events.output.test.json')

describe('Event Service', () => {
  let eventClientStub, clock, todayDateString, tomorrowDateString, sevenDaysFromNowDateString, thirtyDaysFromNowDateString

  before(() => {
    clock = sinon.useFakeTimers(new Date(2016, 2, 15).getTime())
    todayDateString = '2016-03-15'
    tomorrowDateString = '2016-03-16'
    sevenDaysFromNowDateString = '2016-03-22'
    thirtyDaysFromNowDateString = '2016-04-14'
    eventClientStub = sinon.stub(eventClient, 'getEvents')
  })

  afterEach(() => {
    eventClientStub.reset()
  })

  after(() => {
    clock.restore()
    eventClientStub.restore()
  })

  describe('fetchEventById', () => {
    it('should fetch and map data when no query params are presented', async() => {
      eventClientStub.returns(mockD7Response1)
      const eventsResults = await events.fetchEventById(mockD7Response1[0].id)
      eventsResults.should.eql(expectedEventsData1[0])
    })
  })

  describe('fetchEvents', () => {
    it('should fetch and map data when no query params are presented', async() => {
      eventClientStub.returns(mockD7Response1)
      const eventsResults = await events.fetchEvents(null)
      eventsResults.should.eql(expectedEventsData1)
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
  })
})
/* eslint-enable no-unused-expressions */
