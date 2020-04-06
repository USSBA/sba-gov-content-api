/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
let sinon = require('sinon')
let chai = require('chai')
chai.should()

let lenderSearch = require('./lender-search.js')
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
          lender_name: ['Bozeman'],
          geolocation: ['45.66652999999999,-111.047602'],
          address: ['251 A&B Strand Union Building'],
          address_additional: ['Suite 100'],
          city: ['Bozeman'],
          state: ['MT'],
          zipcode: ['59717'],
          contact_first_name: ['Johnny'],
          contact_last_name: ['Monny'],
          contact_email: ['johnnym@sba.gov'],
          contact_phone: ['100-200-3000'],
          contact_fax: ['400-500-6000'],
          is_fast_track: ['1']
        },
        exprs: {
          distance: 100
        }
      },
      {
        id: '5664',
        fields: {
          lender_name: ['Lender Innovations'],
          geolocation: ['39.0496664,-95.67365269999999'],
          address: ['712 S Kansas Ave.'],
          address_additional: ['Suite 1'],
          city: ['Topeka'],
          state: ['KS'],
          zipcode: ['66603'],
          contact_first_name: ['Johnny'],
          contact_last_name: ['Monny'],
          contact_email: ['johnnym@sba.gov'],
          contact_phone: ['785-783-8062'],
          contact_fax: ['245-590-6568'],
          is_fast_track: ['0']
        }
      }
    ]
  }
}

let exampleCloudSearchEmptyResponse = {
  status: { timems: 31, rid: '//mU9b4s+C0KlCOm' },
  hits: { found: 0, start: 0, hit: [] }
}

describe('# Lender Search', () => {
  let dynamoDbClientQueryStub
  let lenderSearchRunSearchStub

  before(() => {
    dynamoDbClientQueryStub = sinon.stub(dynamoDbClient, 'queryDynamoDb')
    lenderSearchRunSearchStub = sinon.stub(cloudsearch, 'runSearch')
  })

  afterEach(() => {
    dynamoDbClientQueryStub.reset()
    lenderSearchRunSearchStub.reset()
  })

  after(() => {
    dynamoDbClientQueryStub.restore()
    lenderSearchRunSearchStub.restore()
  })

  afterEach(() => {
    dynamoDbClientQueryStub.reset()
    lenderSearchRunSearchStub.reset()
  })

  describe('lenderSearch', () => {
    it('should convert distance from miles to km when address is present', async () => {
      dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
      lenderSearchRunSearchStub.returns(exampleCloudSearchResponse)
      const kilometersToMiles = 0.621371
      const distanceInKilometers = exampleCloudSearchResponse.hits.hit[0].exprs.distance
      const expectedApproximateMiles = distanceInKilometers * kilometersToMiles
      let result = await lenderSearch.fetchLenders({ address: 21202 })
      const actualMiles = result.hit[0].exprs.distance
      const actualAndExpectedDiference = Math.abs(expectedApproximateMiles - actualMiles)
      const actualAndOriginalDifference = Math.abs(distanceInKilometers - actualMiles)
      // done this way to handle imprecision in floats
      actualAndExpectedDiference.should.be.lessThan(actualAndOriginalDifference)
    })

    describe('cloudsearch query', () => {
      // should set the sort to distance asc when address is present
      it('should enter lat and long into the params for cloudsearch query when address is passed in', async () => {
        dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
        lenderSearchRunSearchStub.returns(exampleCloudSearchEmptyResponse)
        let result = await lenderSearch.fetchLenders({ address: '06870' })
        lenderSearchRunSearchStub.calledWith({
          query: 'matchall',
          filterQuery: null,
          queryParser: 'structured',
          return: '_all_fields,distance',
          sort: 'distance asc',
          size: 5,
          start: 0,
          expr: '{"distance":"haversin(41.033347,-73.568040,geolocation.latitude,geolocation.longitude)"}'
        }).should.be.true
        result.hit.should.eql(exampleCloudSearchEmptyResponse.hits.hit)
        result.found.should.eql(exampleCloudSearchEmptyResponse.hits.found)
        result.start.should.eql(exampleCloudSearchEmptyResponse.hits.start)
      })

      it('should properly handle an empty address', async () => {
        dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
        lenderSearchRunSearchStub.returns(exampleCloudSearchEmptyResponse)
        let result = await lenderSearch.fetchLenders({ address: null })
        lenderSearchRunSearchStub.calledWith({
          query: 'matchall',
          filterQuery: null,
          queryParser: 'structured',
          return: '_all_fields',
          sort: 'lender_name asc',
          size: 5,
          start: 0
        }).should.be.true
        result.hit.should.eql(exampleCloudSearchEmptyResponse.hits.hit)
        result.found.should.eql(exampleCloudSearchEmptyResponse.hits.found)
        result.start.should.eql(exampleCloudSearchEmptyResponse.hits.start)
      })

      it('should set the filterQuery param for cloudsearch query when hasFiled2019Taxes query parameter is passed in', async () => {
        dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
        lenderSearchRunSearchStub.returns(exampleCloudSearchEmptyResponse)
        let result = await lenderSearch.fetchLenders({ hasFiled2019Taxes: 'true' })
        lenderSearchRunSearchStub.calledWith({
          query: 'matchall',
          filterQuery: 'is_fast_track: 1',
          queryParser: 'structured',
          return: '_all_fields',
          sort: 'lender_name asc',
          size: 5,
          start: 0
        }).should.be.true
        result.hit.should.eql(exampleCloudSearchEmptyResponse.hits.hit)
        result.found.should.eql(exampleCloudSearchEmptyResponse.hits.found)
        result.start.should.eql(exampleCloudSearchEmptyResponse.hits.start)
      })

      it('should NOT set the filterQuery param for cloudsearch query when hasFiled2019Taxes query parameter is empty', async () => {
        dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
        lenderSearchRunSearchStub.returns(exampleCloudSearchEmptyResponse)
        let result = await lenderSearch.fetchLenders({ hasFiled2019Taxes: '' })
        lenderSearchRunSearchStub.calledWith({
          query: 'matchall',
          filterQuery: null,
          queryParser: 'structured',
          return: '_all_fields',
          sort: 'lender_name asc',
          size: 5,
          start: 0
        }).should.be.true
        result.hit.should.eql(exampleCloudSearchEmptyResponse.hits.hit)
        result.found.should.eql(exampleCloudSearchEmptyResponse.hits.found)
        result.start.should.eql(exampleCloudSearchEmptyResponse.hits.start)
      })
    })

    describe('results', () => {
      it('should return distance when there is an address parameter is passed in', async () => {
        dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
        lenderSearchRunSearchStub.returns(exampleCloudSearchResponse)
        let result = await lenderSearch.fetchLenders({ address: '21202' })
        result.hit[0].exprs.hasOwnProperty('distance').should.be.true
      })

      it('should NOT return distance when NO query parameters are passed in', async () => {
        dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
        lenderSearchRunSearchStub.returns(exampleCloudSearchResponse)
        let result = await lenderSearch.fetchLenders({})
        result.hit[0].hasOwnProperty('exprs').should.be.false
        result.hit[1].hasOwnProperty('exprs').should.be.false
      })

      it('should NOT return distance when mapCenter parameter is present in place of address', async () => {
        dynamoDbClientQueryStub.returns(exampleDynamoDBResponse)
        lenderSearchRunSearchStub.returns(exampleCloudSearchResponse)
        let result = await lenderSearch.fetchLenders({ mapCenter: '1,1' })
        result.hit[0].hasOwnProperty('exprs').should.be.false
        result.hit[1].hasOwnProperty('exprs').should.be.false
      })
    })
  })
})
/* eslint-enable no-unused-expressions */
