/* eslint-env mocha */
let config = require('config')
let chai = require('chai')
chai.should()

let officeSearch = require('./office-search.js')

let aws = require('aws-sdk')
const csd = new aws.CloudSearchDomain({
  endpoint: config.get('aws.cloudsearch.officeEndpoint'),
  region: 'us-east-1',
  apiVersions: '2013-01-01'
})

let baseDocument = {
  type: 'add',
  id: 1,
  fields: {
    location_city: 'New Orleans',
    location_state: 'LA',
    location_zipcode: '70130',
    location_name: 'New Orleans',
    location_hours_of_operation: 'Monday through Friday from 9 a.m. to 5 p.m.',
    title: 'IDEAx',
    office_type: 'Startup accelerator',
    type: 'office',
    location_street_address: '515 Girod Street',
    geolocation: '35.628611, -87.0'
  }
}

function makeDocument (documentData) {
  let { id, latitude, longitude } = documentData
  return Object.assign({}, baseDocument, {
    id: id,
    fields: {
      location_city: 'Mos Eisley',
      location_state: 'AA',
      location_zipcode: String(id).padStart(5),
      location_name: 'Office Name ' + id,
      location_hours_of_operation: 'Monday through Friday from 9 a.m. to 5 p.m.',
      title: 'Office Number ' + id,
      office_type: 'Some Office Type',
      type: 'office',
      location_street_address: id + ' Skywalker Street',
      geolocation: latitude + ', ' + longitude
    }
  })
}

async function sleep (milliseconds) {
  console.log(`Sleeping for ${milliseconds} ms`)
  return new Promise((resolve, reject) => {
    setTimeout(resolve, milliseconds)
  })
}

async function checkForDocuments (numberOfDocuments) {
  console.log('Checking for documents....')
  let result = await csd.search({ query: 'Office', start: 0, size: 100 }).promise()
  let found = result.hits.found
  console.log(`Found ${found} documents`)
  return found === numberOfDocuments
}

async function insertDocuments (docs) {
  let documents = docs.map(makeDocument)
  let params = {
    contentType: 'application/json',
    documents: JSON.stringify(documents)
  }
  console.log('Upload documents to ' + config.get('aws.cloudsearch.officeEndpoint'))
  let result = await csd.uploadDocuments(params).promise()
  console.log('Results of upload were ', result)
}

async function deleteDocuments (ids) {
  let deleteDocuments = ids.map(item => {
    return {
      type: 'delete',
      id: item
    }
  })
  let params = {
    contentType: 'application/json',
    documents: JSON.stringify(deleteDocuments)
  }
  let result = await csd.uploadDocuments(params).promise()
  console.log('Results from the delete were ', result)
}

describe('# Office Search', function () {
  this.timeout(60000)

  describe('officeSearch', () => {
    let masterDocuments = [
      {
        id: 1,
        latitude: 35.7,
        longitude: -87.0
      },
      {
        id: 2,
        latitude: 41,
        longitude: -105.0
      },
      {
        id: 3,
        latitude: 20,
        longitude: -20.0
      },
      {
        id: 4,
        latitude: 42.99467,
        longitude: -72.720362
      },
      {
        id: 5,
        latitude: 43.0,
        longitude: -72.720362
      }
    ]

    before(async () => {
      // check connection to AWS
      await csd.search({ query: 'test', size: 1 }).promise()
      // insert test documents
      await insertDocuments(masterDocuments)
      let waitingOnInsert = true
      do {
        waitingOnInsert = !await checkForDocuments(masterDocuments.length)
        await sleep(2000)
      } while (waitingOnInsert)
    })

    after(async () => {
      // delete all the test documents
      await sleep(3000)
      await deleteDocuments(masterDocuments.map(item => item.id))
      let waitingOnDelete = true
      do {
        waitingOnDelete = !await checkForDocuments(0)
        await sleep(3000)
      } while (waitingOnDelete)
    })

    it('should return office 1 as the closest to 38401', async () => {
      let result = await officeSearch.officeSearch({ address: '38401', pageSize: 2 })
      let hits = result.hit
      hits.should.have.length(2)
      hits[0].fields.title[0].should.equal('Office Number 1')
    })

    it('should return office 1 as the closest to 80612', async () => {
      let result = await officeSearch.officeSearch({ address: '80612', pageSize: 2 })
      let hits = result.hit
      hits.should.have.length(2)
      hits[0].fields.title[0].should.equal('Office Number 2')
    })

    it('should return office 4 as the closest to 05302 because they are the same coordinates', async () => {
      let result = await officeSearch.officeSearch({ address: '05302', pageSize: 2 })
      let hits = result.hit
      hits.should.have.length(2)
      hits[0].fields.title[0].should.equal('Office Number 4')
      hits[0].exprs.distance.should.equal('0.0')
      hits[1].fields.title[0].should.equal('Office Number 5')
    })

    it('should find the next two closest offices to 05302', async () => {
      let result = await officeSearch.officeSearch({ address: '05302', pageSize: 2, start: 2 })
      let hits = result.hit
      hits.should.have.length(2)
      hits[0].fields.title[0].should.equal('Office Number 1')
      hits[1].fields.title[0].should.equal('Office Number 2')
    })

    it('should not return any offices when searching with an invalid zip code 99998', async () => {
      let result = await officeSearch.officeSearch({ address: '99998', pageSize: 2 })
      let hits = result.hit
      hits.should.have.length(0)
    })

    it('should return offices in alphabetical order when searching without an address', async () => {
      let result = await officeSearch.officeSearch({ pageSize: 5 })
      let hits = result.hit
      hits.should.have.length(5)
      hits[0].fields.title[0].should.equal('Office Number 1')
      hits[1].fields.title[0].should.equal('Office Number 2')
      hits[2].fields.title[0].should.equal('Office Number 3')
      hits[3].fields.title[0].should.equal('Office Number 4')
      hits[4].fields.title[0].should.equal('Office Number 5')
    })
  })
})
