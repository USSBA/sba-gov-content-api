const s3CacheReader = require('../clients/s3-cache-reader.js')
const searchUtils = require('./search-utils.js')

function fetchBlogs (params = []) {
  return s3CacheReader.getKey('blog').then(result => {
    let blogs = filterBlogs(result, params)
    let sortedBlogs = sortBlogs(blogs, params.order)
    return searchUtils.paginateSearch(sortedBlogs, params.start, params.end)
  })
}

function filterBlogs (blogs, params = []) {
  if (params.length === 0) {
    return blogs
  }
  let filteredBlogs = blogs.filter(blog => {
    if (params.category && (blog.category !== params.category)) {
      return false
    }
    if (Number(params.author) && (blog.author !== Number(params.author))) {
      return false
    }
    return true
  })
  return filteredBlogs
}

function sortBlogs (blogs, order = 'desc') {
  let sortedBlogs = blogs.sort((blogA, blogB) => {
    if (blogA.created < blogB.created) {
      return 1
    } else if (blogA.created > blogB.created) {
      return -1
    } else {
      return 0
    }
  })
  if (order === 'asc') {
    return sortedBlogs.reverse()
  } else {
    return sortedBlogs
  }
}

function fetchBlog (params) {
  if (params === undefined || params === null) {
    return {}
  }
  return s3CacheReader.getKey('blog').then(blogs => {
    let result = blogs.find((blog, index) => {
      let item
      if (Number(params.id) && (blog.id === Number(params.id))) {
        item = blog
        item.isFound = true
      }
      return item
    })
    if (result === undefined) {
      return {}
    } else {
      return result
    }
  })
}

module.exports.fetchBlogs = fetchBlogs
module.exports.fetchBlog = fetchBlog
