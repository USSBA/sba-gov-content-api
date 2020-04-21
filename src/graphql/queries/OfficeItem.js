'use strict'
const GraphQL = require('graphql')
const {
  GraphQLList
} = GraphQL
console.log('E')
const OfficeItemType = require('../types/OfficeItem')
const OfficeItemResolver = require('../resolvers/OfficeItems')
module.exports = {
  index () {
    console.log('L')
    return {
      type: new GraphQLList(OfficeItemType),
      description: 'This will return office items from S3.',
      resolve (parent, args, context, info) {
        return OfficeItemResolver.index()
      }
    }
  }
}
