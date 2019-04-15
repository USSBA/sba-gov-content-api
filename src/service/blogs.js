const s3CacheReader = require('../clients/s3-cache-reader.js')
const searchUtils = require('./search-utils.js')

function fetchBlogs(params = []) {
  return s3CacheReader.getKey('blog').then(result => {
    let blogs = filterBlogs(result, params)
    let sortedBlogs = sortBlogs(blogs, params.order)
    return searchUtils.paginateSearch(sortedBlogs, params.start, params.end)
  })
}

function filterBlogs(blogs, params = []) {
  let filterParams = params.omit(['start', 'end'])
  if (filterParams.length === 0) {
    return blogs
  }
  let filteredBlogs = blogs.filter(blog => {
    if (blog.summary.category === filterParams.category) {
      return true
    }
    if (blog.summary.author === filterParams.author) {
      return true
    }
    return false
  })
  return filteredBlogs
}

function sortBlogs(blogs, order = 'desc') {
  let sortedBlogs = blogs.sort((blogA, blogB) => {
    if (blogA.published_date < blogB.published_date) {
      return 1
    } else if (blogA.published_date > blogB.published_date) {
      return -1
    } else {
      return 0
    }
  })
  if (order === 'asc') {
    return sortedBlogs.reverse()
  } else {
    return sortBlogs
  }
}

function fetchBlog(params) {
  return s3CacheReader.getKey('blog').then(blogs => {
    const result = blogs.find((blog, index) => {
      let item
      if (blog.id === params.id) {
        item = blog
        item.isFound = true
      }
      return item
    })
    return result
  })
}

module.exports.fetchBlogs = fetchBlogs
module.exports.fetchBlog = fetchBlog
