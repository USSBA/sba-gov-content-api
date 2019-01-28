/* eslint-env mocha */

let axios = require('axios')
let sinon = require('sinon')
let chai = require('chai')
chai.should()

var events = require('./events')

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

  it('gets a list of events for an organization', async () => {
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
})
