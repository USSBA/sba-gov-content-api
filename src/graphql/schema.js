'use strict'
const GraphQL = require('graphql')
const {
  GraphQLObjectType,
  GraphQLSchema
} = GraphQL
console.log('C')
const MainMenuItemQuery = require('./queries/MainMenuItem')
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  description: 'This is the default root query provided by our application.',
  fields: {
    mainMenuItems: MainMenuItemQuery.index()
  }
})
module.exports = new GraphQLSchema({
  query: RootQuery
})
