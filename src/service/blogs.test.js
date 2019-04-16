const chai = require('chai')
const sinon = require('sinon')
var expect = require('chai').expect

const {fetchBlogs, fetchBlog } = require('./blogs.js')
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

    const result = await fetchBlog({ 'id': '10000' })
    expect(result).to.be.a('object')
    expect(result.id).to.equal(10000)
  })
  it('should return an empty object when NO blog matches the given ID', async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const result = await fetchBlog({ 'id': '99999' })
    expect(result).to.be.a('object')
    expect(result).to.be.empty
  })
  it('should return back an empty object if given NO parameters', async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const result = await fetchBlog()
    expect(result).to.be.a('object')
    expect(result).to.be.empty
  })
  it('should return back an empty object if given invalid parameters', async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const result = await fetchBlog({ 'foo': 'bar' })
    expect(result).to.be.a('object')
    expect(result).to.be.empty
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
    expect(results).to.be.a('array')
    expect(results).to.have.lengthOf(blogs.length)
    expect(results[0].created > results[1].created).to.equal(true)
  })
  it("should return blogs in ascending order when given the 'ascending' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'order': 'asc' })
    expect(results[0].created > results[1].created).to.equal(false)
  })
  it("should only return the correct blogs when given a 'category' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'category': 'foo' })
    expect(results).to.have.lengthOf(2)
    expect(results[0].category).to.equal('foo')
  })
  it("should only return blogs by the correct author when given a 'author' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'author': '22222' })
    expect(results).to.have.lengthOf(2)
    expect(results[0].author).to.equal(22222)
  })
  it("should return only the correct blogs when given a 'category' and 'author'", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'category': 'bar', 'author': '22222' })
    expect(results).to.have.lengthOf(1)
    expect(results[0].category).to.equal('bar')
    expect(results[0].author).to.equal(22222)
  })
  it('should return back all the blogs when given an invalid parameter', async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'foo': 'bar' })
    expect(results).to.have.lengthOf(blogs.length)
  })
  it("should return the correct number of blogs when given an 'end' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'end': 3 })
    expect(results).to.have.lengthOf(3)
  })
  it("should return the correct blogs when given an 'start' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'start': 2 })
    expect(results).to.have.lengthOf(blogs.length - 2)
    const control = await fetchBlogs()
    expect(results[0].id).to.not.equal(control[0].id)
    expect(results[0].id).to.equal(control[2].id)
  })
  it("should return the correct blogs when given both a 'start' and 'end' parameter", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'start': 2, 'end': 4 })
    expect(results).to.have.lengthOf(2)
    const control = await fetchBlogs()
    expect(results[0].id).to.not.equal(control[0].id)
    expect(results[0].id).to.equal(control[2].id)
    expect(results[1].id).to.equal(control[3].id)
  })
  xit("should return the correct blogs when given 'start', 'end', and 'category' parameters", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'start': 1, 'end': 4, 'category': 'bar' })
  })
  xit("should return the correct blogs when given 'start', 'end', 'order', and 'category' parameters", async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'start': 1, 'end': 4, 'order': 'asc', 'category': 'bar' })
  })
  it('should return NO blogs when no blogs match valid search parameters', async () => {
    getKeyStub.withArgs('blog').returns(Promise.resolve(blogs))

    const results = await fetchBlogs({ 'category': 'no a real category' })
    expect(results).to.be.a('array')
    expect(results).to.have.lengthOf(0)
  })
})
