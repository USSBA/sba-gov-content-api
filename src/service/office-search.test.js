/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()

let officeSearch = require('./office-search.js')
let dynamoDbClient = require('../clients/dynamo-db-client.js')
let cloudsearch = require('../clients/cloudsearch.js')

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

let exampleCloudSearchResponse = {
  status: { timems: 3, rid: '3sCN9b4slBwKlnJa' },
  hits: {
    found: 526,
    start: 0,
    hit: [
      {
        id: '5663',
        fields: {
          location_city: ['Bozeman'],
          location_state: ['MT'],
          location_zipcode: ['59717'],
          location_name: ['Bozeman'],
          location_hours_of_operation: ['Monday through Friday from 9 a.m. to 5 p.m.'],
          title: ['406 Labs'],
          office_type: ['Startup accelerator'],
          geolocation: ['45.66652999999999,-111.047602'],
          office_website: ['http://www.montana.edu/launchpad/accelerator.html'],
          type: ['office'],
          location_street_address: ['251 A&B Strand Union Building']
        },
        exprs: {
          distance: 100
        }
      },
      {
        id: '5664',
        fields: {
          location_city: ['Topeka'],
          location_phone_number: ['785-783-8062'],
          location_zipcode: ['66603'],
          location_name: ['Topeka'],
          location_hours_of_operation: ['Monday through Friday from 9 a.m. to 5 p.m.'],
          location_state: ['KS'],
          title: ['712 Innovations'],
          office_type: ['Startup accelerator'],
          geolocation: ['39.0496664,-95.67365269999999'],
          office_website: ['http://www.712Innovations.com'],
          type: ['office'],
          location_street_address: ['712 S Kansas Ave., Suite 1']
        }
      }
    ]
  }
}

let exampleCloudSearchEmptyResponse = {
  status: { timems: 31, rid: '//mU9b4s+C0KlCOm' },
  hits: { found: 0, start: 0, hit: [] }
}

describe('# Office Search', () => {
  let dynamoDbClientQueryStub
  let officeSearchRunSearchStub

  before(() => {
    dynamoDbClientQueryStub = sinon.stub(dynamoDbClient, 'queryDynamoDb')
    officeSearchRunSearchStub = sinon.stub(cloudsearch, 'runSearch')
  })

  afterEach(() => {
    dynamoDbClientQueryStub.reset()
    officeSearchRunSearchStub.reset()
  })

  after(() => {
    dynamoDbClientQueryStub.restore()
    officeSearchRunSearchStub.restore()
  })

  afterEach(() => {
    dynamoDbClientQueryStub.reset()
    officeSearchRunSearchStub.reset()
  })

  describe('officeSearch', () => {
    it('should properly handle an empty address', async () => {
      dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
      officeSearchRunSearchStub.returns(exampleCloudSearchEmptyResponse)
      let result = await officeSearch.fetchOffices({ address: null })
      officeSearchRunSearchStub.calledWith({
        query: `type: 'office'`,
        filterQuery: null,
        queryParser: 'structured',
        return: '_all_fields',
        sort: 'title asc',
        size: 20,
        start: 0
      }).should.be.true
      result.hit.should.eql(exampleCloudSearchEmptyResponse.hits.hit)
      result.found.should.eql(exampleCloudSearchEmptyResponse.hits.found)
      result.start.should.eql(exampleCloudSearchEmptyResponse.hits.start)
    })

    it('should convert distance from miles to kg when address is present', async () => {
      dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
      officeSearchRunSearchStub.returns(exampleCloudSearchResponse)
      const kilometersToMiles = 0.621371
      const distanceInKilometers = exampleCloudSearchResponse.hits.hit[0].exprs.distance
      const expectedApproximateMiles = distanceInKilometers * kilometersToMiles
      let result = await officeSearch.fetchOffices({ address: 21202 })
      const actualMiles = result.hit[0].exprs.distance
      const actualAndExpectedDiference = Math.abs(expectedApproximateMiles - actualMiles)
      const actualAndOriginalDifference = Math.abs(distanceInKilometers - actualMiles)
      // done this way to handle imprecision in floats
      actualAndExpectedDiference.should.be.lessThan(actualAndOriginalDifference)
    })

    it('should not return distance when no query parameters are present', async () => {
      dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
      officeSearchRunSearchStub.returns(exampleCloudSearchResponse)
      let result = await officeSearch.fetchOffices({})
      result.hit[0].hasOwnProperty('exprs').should.be.false
      result.hit[1].hasOwnProperty('exprs').should.be.false
    })

    it('should not return distance when no only mapCenter parameter is present', async () => {
      dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
      officeSearchRunSearchStub.returns(exampleCloudSearchResponse)
      let result = await officeSearch.fetchOffices({ mapCenter: '1,1' })
      result.hit[0].hasOwnProperty('exprs').should.be.false
      result.hit[1].hasOwnProperty('exprs').should.be.false
    })

    it('should return distance when there is an address parameter present', async () => {
      dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
      officeSearchRunSearchStub.returns(exampleCloudSearchResponse)
      let result = await officeSearch.fetchOffices({ address: '21202' })
      result.hit[0].hasOwnProperty('exprs').should.be.true
    })

    it('should properly handle no address', async () => {
      dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
      officeSearchRunSearchStub.returns(exampleCloudSearchEmptyResponse)
      let result = await officeSearch.fetchOffices({})
      officeSearchRunSearchStub.calledWith({
        query: `type: 'office'`,
        filterQuery: null,
        queryParser: 'structured',
        return: '_all_fields',
        sort: 'title asc',
        size: 20,
        start: 0
      }).should.be.true
      result.hit.should.eql(exampleCloudSearchEmptyResponse.hits.hit)
      result.found.should.eql(exampleCloudSearchEmptyResponse.hits.found)
      result.start.should.eql(exampleCloudSearchEmptyResponse.hits.start)
    })

    // it('should return result when query by id', async () => {
    //   dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
    //   officeSearchRunSearchStub.returns(exampleCloudSearchResponse)
    //   let result = await officeSearch.fetchOffices({ id: '5663' })
    //   console.log('result is >>', result.hit)
    //   console.log('result count is', result.hit.count)
    //   officeSearchRunSearchStub.callCount.should.eql(1)
    //   console.log(officeSearchRunSearchStub.callCount)
    //   officeSearchRunSearchStub.calledWith({
    //     query: `type: 'office' _id: '5663'`
    //   }).should.be.true
    //   console.log('called with >>>>>>', officeSearchRunSearchStub)
    // })

    it('should enter the lat and long into the params for cloudsearch query', async () => {
      dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
      officeSearchRunSearchStub.returns(exampleCloudSearchEmptyResponse)
      let result = await officeSearch.fetchOffices({ address: '06870' })
      officeSearchRunSearchStub.calledWith({
        query: `type: 'office'`,
        filterQuery: null,
        queryParser: 'structured',
        return: '_all_fields,distance',
        sort: 'distance asc',
        size: 20,
        start: 0,
        expr: '{"distance":"haversin(41.033347,-73.568040,geolocation.latitude,geolocation.longitude)"}'
      }).should.be.true
      result.hit.should.eql(exampleCloudSearchEmptyResponse.hits.hit)
      result.found.should.eql(exampleCloudSearchEmptyResponse.hits.found)
      result.start.should.eql(exampleCloudSearchEmptyResponse.hits.start)
    })

    it('when there is no result it should fetch the district sba office closest to the provided geolocation', async () => {
      dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
      officeSearchRunSearchStub.returns(exampleCloudSearchEmptyResponse)
      let result = await officeSearch.fetchOffices({ address: '06870' })
      officeSearchRunSearchStub.callCount.should.eql(2)
      officeSearchRunSearchStub.calledWith({
        query: `type: 'office'`,
        filterQuery: `office_type: 'SBA district office'`,
        sort: 'distance asc',
        return: '_all_fields,distance',
        expr: `{"distance":"haversin(41.033347,-73.568040,geolocation.latitude,geolocation.longitude)"}`,
        queryParser: 'structured',
        size: 1,
        start: 0
      }).should.be.true
      result.hasOwnProperty('suggestedResults').should.be.true
    })

    it('when there are no results with no address it defaults to the geocode for the dc office', async () => {
      dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
      officeSearchRunSearchStub.returns(exampleCloudSearchEmptyResponse)
      let result = await officeSearch.fetchOffices()
      officeSearchRunSearchStub.callCount.should.eql(2)
      officeSearchRunSearchStub.calledWith({
        query: `type: 'office'`,
        filterQuery: `office_type: 'SBA district office'`,
        sort: 'distance asc',
        return: '_all_fields,distance',
        expr: `{"distance":"haversin(38.893311,-77.014647,geolocation.latitude,geolocation.longitude)"}`,
        queryParser: 'structured',
        size: 1,
        start: 0
      }).should.be.true
      result.hasOwnProperty('suggestedResults').should.be.true
    })
  })
})
/* eslint-enable no-unused-expressions */
