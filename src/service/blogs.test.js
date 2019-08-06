/* eslint-env mocha */
const sinon = require('sinon')
var expect = require('chai').expect
const { clone } = require('lodash')

const { fetchBlogs, fetchBlog } = require('./blogs.js')
const s3CacheReader = require('../clients/s3-cache-reader.js')

const blogs = require('../test-data/blogs.js')

describe('Fetching an individual blog', () => {
  let getKeyStub

  before(() => {
    getKeyStub = sinon.stub(s3CacheReader, 'getKey')
  })

  afterEach(() => {
    getKeyStub.reset()
  })

  after(() => {
    getKeyStub.restore()
  })

  it('should return a blog when given a blog ID', async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const result = await fetchBlog('10000')
    expect(result).to.be.a('object')
    expect(result.id).to.equal(10000)
  })
  it('should return an empty object when NO blog matches the given ID', async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const result = await fetchBlog('99999')
    expect(result).to.be.a('object')
    expect(result).to.eql({})
  })
  it('should return back an empty object if given NO parameters', async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const result = await fetchBlog()
    expect(result).to.be.a('object')
    expect(result).to.eql({})
  })
  it('should return back an empty object if given invalid parameters', async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const result = await fetchBlog('bar')
    expect(result).to.be.a('object')
    expect(result).to.eql({})
  })
})

describe('Searching for blogs', () => {
  let getKeyStub

  before(() => {
    getKeyStub = sinon.stub(s3CacheReader, 'getKey')
  })

  afterEach(() => {
    getKeyStub.reset()
  })

  after(() => {
    getKeyStub.restore()
  })

  it('should return all blogs in descending order when not given any parameters', async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs()
    const resultsTotal = results['total']
    const resultsBlogs = results['blogs']

    expect(results).to.be.a('object')
    expect(resultsTotal).to.be.a('number')
    expect(resultsTotal).to.equal(blogs.length)
    expect(resultsBlogs).to.be.a('array')
    expect(resultsBlogs).to.have.lengthOf(resultsTotal)
    expect(resultsBlogs).to.have.lengthOf(blogs.length)
    expect(resultsBlogs[0].created > resultsBlogs[1].created).to.equal(true)
  })
  it("should return blogs in ascending order when given the 'ascending' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'order': 'asc' })
    const resultsBlogs = results['blogs']

    expect(resultsBlogs[0].created > resultsBlogs[1].created).to.equal(false)
  })
  it("should only return the correct blogs when given a 'category' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'category': 'foo' })
    const resultsTotal = results['total']
    const resultsBlogs = results['blogs']

    expect(resultsTotal).to.equal(2)
    expect(resultsBlogs).to.have.lengthOf(2)
    expect(resultsBlogs[0].blogCategory).to.equal('foo')
  })
  it("should only return blogs by the correct author when given a 'author' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'author': '22222' })
    const resultsTotal = results['total']
    const resultsBlogs = results['blogs']

    expect(resultsTotal).to.equal(2)
    expect(resultsBlogs).to.have.lengthOf(2)
    expect(resultsBlogs[0].author).to.equal(22222)
  })
  it("should only return blogs by the correct office when given an 'office' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'office': '99991' })
    const resultsTotal = results['total']
    const resultsBlogs = results['blogs']

    expect(resultsTotal).to.equal(3)
    expect(resultsBlogs).to.have.lengthOf(3)
    expect(resultsBlogs[0].office).to.equal(99991)
  })
  it("should return only the correct blogs when given a 'category', 'author', and 'office'", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'category': 'bar', 'author': '22222', 'office': '99992' })
    const resultsTotal = results['total']
    const resultsBlogs = results['blogs']

    expect(resultsTotal).to.equal(1)
    expect(resultsBlogs).to.have.lengthOf(1)
    expect(resultsBlogs[0].blogCategory).to.equal('bar')
    expect(resultsBlogs[0].author).to.equal(22222)
    expect(resultsBlogs[0].office).to.equal(99992)
  })
  it('should return back all the blogs when given an invalid parameter', async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'foo': 'bar' })
    const resultsTotal = results['total']
    const resultsBlogs = results['blogs']

    expect(resultsTotal).to.equal(blogs.length)
    expect(resultsBlogs).to.have.lengthOf(blogs.length)
  })
  it("should return the correct number of blogs when given an 'end' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const endIndexValue = 3
    // The expected result count will be equal to the end index value
    // because the end index is not included in the result list
    const expectedResultCount = endIndexValue

    const results = await fetchBlogs({ 'end': endIndexValue })

    expect(results.blogs).to.have.lengthOf(expectedResultCount)
  })
  it("should return the correct blogs when given a 'start' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const expectedDisplayedTotal = blogs.length
    const startIndex = 2
    // note: the start index is included in the result list
    const expectedResultCount = expectedDisplayedTotal - startIndex

    const results = await fetchBlogs({ 'start': startIndex })

    expect(results.total).to.equal(expectedDisplayedTotal)
    expect(results.blogs.length).to.equal(expectedResultCount)
  })
  it("should return the correct blogs when given both a 'start' and 'end' parameter", async () => {
    // this is to ensure that the most recent blogs are in indices 0 through 3
    const blogsList = clone(blogs)
    blogsList[0].created = 9999999999
    blogsList[1].created = 9999999998
    blogsList[2].created = 9999999997
    blogsList[3].created = 9999999996

    getKeyStub.withArgs('blog').returns(Promise.resolve(blogsList))

    const results = await fetchBlogs({ 'start': 2, 'end': 4 })

    expect(results.blogs).to.have.lengthOf(2)
    expect(results.blogs[0].id).to.equal(blogsList[2].id)
    expect(results.blogs[1].id).to.equal(blogsList[3].id)
  })
  it("should return the correct blogs when given both a 'start' and 'end' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'start': 2, 'end': 4 })
    const resultsTotal = results['total']
    const resultsBlogs = results['blogs']
    const control = await fetchBlogs()
    const controlTotal = control['total']
    const controlBlogs = control['blogs']

    expect(resultsBlogs).to.have.lengthOf(2)
    expect(resultsTotal).to.equal(controlTotal)
    expect(resultsBlogs[0].id).to.not.equal(controlBlogs[0].id)
    expect(resultsBlogs[0].id).to.equal(controlBlogs[2].id)
    expect(resultsBlogs[1].id).to.equal(controlBlogs[3].id)
  })
  it("should return the correct blogs given 'start' and 'end' parameters when combined with a 'category' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'start': 1, 'end': 3, 'category': 'bar' })
    const resultsTotal = results['total']
    const resultsBlogs = results['blogs']
    const control = await fetchBlogs({ 'category': 'bar' })
    const controlTotal = control['total']
    const controlBlogs = control['blogs']

    expect(resultsTotal).to.equal(controlTotal)
    expect(resultsBlogs.length).to.not.equal(controlBlogs.length)
    expect(resultsBlogs).to.have.lengthOf(2)
    expect(resultsBlogs[0]).to.not.equal(controlBlogs[0])
    expect(resultsBlogs[0]).to.equal(controlBlogs[1])
  })
  it("should return the correct blogs given 'asc' parameter when combined with 'start', 'end', 'order', 'category', and parameters", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'start': 1, 'end': 3, 'order': 'asc', 'category': 'bar' })
    const resultsTotal = results['total']
    const resultsBlogs = results['blogs']
    const control = await fetchBlogs({ 'start': 1, 'end': 3, 'category': 'bar' })
    const controlTotal = control['total']
    const controlBlogs = control['blogs']

    expect(resultsTotal).to.equal(controlTotal)
    expect(resultsBlogs.length).to.equal(controlBlogs.length)
    expect(resultsBlogs[0]).to.not.equal(controlBlogs[0])
    expect(resultsBlogs[0].id).to.equal(controlBlogs[1].id)
  })
  it('should return NO blogs when no blogs match valid search parameters', async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'category': 'not a real category' })
    const resultsTotal = results['total']
    const resultsBlogs = results['blogs']

    expect(resultsTotal).to.equal(0)
    expect(resultsBlogs).to.be.a('array')
    expect(resultsBlogs).to.have.lengthOf(0)
  })
})
