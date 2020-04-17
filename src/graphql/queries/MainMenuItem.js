'use strict'
const GraphQL = require('graphql')
const {
  GraphQLList
} = GraphQL
console.log('E')
const MainMenuItemType = require('../types/MainMenuItem')
const MainMenuItemResolver = require('../resolvers/MainMenuItems')
module.exports = {
  index () {
    console.log('L')
    return {
      type: new GraphQLList(MainMenuItemType),
      description: 'This will return main menu items from S3.',
      resolve (parent, args, context, info) {
        return MainMenuItemResolver.index()
      }
    }
  }
}
