/* eslint-env mocha */

let axios = require('axios')
let sinon = require('sinon')
let chai = require('chai')
chai.should()

var events = require('./events')
var eventsData = require('./mock-events-data.json')

describe('Eventbrite client', () => {
  let axiosGetStub

  before(() => {
    axiosGetStub = sinon.stub(axios, 'get')
  })

  afterEach(() => {
    axiosGetStub.reset()
  })

  after(()=>{
    axiosGetStub.restore()
  })

  it('reads the organization ID from the config', async () => {
    const expectedOrganizationId = '100'
    const mockResponseOrganizationId = {
      data: {
        organizations: [
          { _type: 'organization',
            name: 'SBA GOV',
            vertical: 'default',
            locale: null,
            image_id: null,
            id: expectedOrganizationId
          }
        ]
      }
    }

    axiosGetStub.returns(mockResponseOrganizationId)
    const organizationId = await events.getOrganizationId()
    organizationId.should.eql(expectedOrganizationId)
  })

  // skipping this test until we have more clarification on the backend api
  // that we will be invoking.

  it.skip('gets a list of events for an organization', async () => {
    const expectedEvents = [
      { id: '111' },
      { id: '222' }
    ]
    const mockResponseEvents = {
      data: {
        events: [
          { id: '111' },
          { id: '222' }
        ]
      }
    }

    axiosGetStub.returns(mockResponseEvents)
    const eventBriteEvents = await events.fetchEvents()
    eventBriteEvents.should.eql(expectedEvents)
  })

  it('gets mock events data', async () => {
    const expected = eventsData
    const result = await events.fetchEvents()
    result.should.eql(expected)
  })

  it('filter event by zipcode', async () => {
    const params = {
      address: '20000'
    }
    const expected = eventsData.filter( item => item.location.zipcode === params.address)
    const result = await events.fetchEvents(params)
    expected.length.should.eql(result.length)
  })
})
