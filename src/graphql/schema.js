'use strict'
const GraphQL = require('graphql')
const {
  GraphQLObjectType,
  GraphQLSchema
} = GraphQL
console.log('C')
const MainMenuItemQuery = require('./queries/MainMenuItem')
const OfficeItemQuery = require('./queries/OfficeItem')
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  description: 'This is the default root query provided by our application.',
  fields: {
    mainMenuItems: MainMenuItemQuery.index(),
    officeItems: OfficeItemQuery.index()
  }
})
module.exports = new GraphQLSchema({
  query: RootQuery
})
