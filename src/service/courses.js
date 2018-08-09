const { get } = require('./drupal-eight.js')

function fetchCourses (params) {
  return get('courses').then(result => {
    const filteredItems = []
    if (!params.businessStage || params.businessStage === 'All') {
      const sortedItems = sortItems(result, params.sortBy)
      return sortedItems
    } else {
      result.forEach(item => {
        if (item.courseCategory.includes(params.businessStage)) {
          filteredItems.push(item)
        }
      })
      const sortedAndFilteredItems = sortItems(filteredItems, params.sortBy)
      return sortedAndFilteredItems
    }
  })
}

function sortItems (items, sortBy) {
  if (sortBy === 'Title') {
    const sortedItems = [].concat(items).sort((itemA, itemB) => {
      if (itemA.title < itemB.title) {
        return -1
      }
      if (itemA.title > itemB.title) {
        return 1
      }
      return 0
    })
    return sortedItems
  } else {
    return items
  }
}

function fetchCourse (params) {
  return get('courses').then(courses => {
    const result = courses.find((course, index) => {
      let item

      if (course.url === params.pathname) {
        item = course
        item.isFound = true
      }
      return item
    })

    return result
  })
}

module.exports.fetchCourses = fetchCourses
module.exports.fetchCourse = fetchCourse
