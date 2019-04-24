const s3CacheReader = require('../clients/s3-cache-reader.js')
const searchUtils = require('./search-utils.js')

function fetchBlogs (params = []) {
  return s3CacheReader.getKey('blog').then(result => {
    let blogs = filterBlogs(result, params)
    let sortedBlogs = sortBlogs(blogs, params.order)
    return { total: sortedBlogs.length, blogs: searchUtils.paginateSearch(sortedBlogs, params.start, params.end) }
  })
}

function filterBlogs (blogs = [], params = []) {
  let filteredBlogs = blogs.filter(blog => {
    let includeBlog = true
    if (params.category && (blog.blogCategory !== params.category)) {
      includeBlog = false
    }
    if (Number(params.author) && (blog.author !== Number(params.author))) {
      includeBlog = false
    }
    return includeBlog
  })
  return filteredBlogs
}

function sortBlogs (blogs, order = 'desc') {
  let sortedBlogs = blogs.sort((blogA, blogB) => {
    let sortCheck = 0
    if (blogA.created < blogB.created) {
      sortCheck = 1
    } else if (blogA.created > blogB.created) {
      sortCheck = -1
    }
    return sortCheck
  })
  if (order === 'asc') {
    sortedBlogs = sortedBlogs.reverse()
  }
  return sortedBlogs
}

function fetchBlog (id) {
  return s3CacheReader.getKey('blog').then(blogs => {
    blogs = blogs || []
    let result = {}
    result = blogs.find((blog, index) => {
      let item
      if (blog.id === Number(id)) {
        item = blog
        item.isFound = true
      }
      return item
    })
    if (result === undefined) {
      result = {}
    }
    return result
  })
}

module.exports.fetchBlogs = fetchBlogs
module.exports.fetchBlog = fetchBlog
