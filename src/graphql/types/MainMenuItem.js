'use strict'
const GraphQL = require('graphql')
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} = GraphQL
console.log('F')
const MainMenuItemType = new GraphQLObjectType({
  name: 'MainMenuItem',
  description: 'MainMenuItem Type for the main menu items stored in S3.',
  fields: () => ({
    linkTitle: {
      type: GraphQLString,
      description: 'title of menu item link'
    },
    link: {
      type: GraphQLString,
      description: 'route of menu item'
    },
    children: {
      type: new GraphQLList(MainMenuItemType),
      description: 'children of menu item'
    },
    spanishTranslation: {
      type: new GraphQLObjectType({
        name: 'SpanishMainMenuItem',
        description: 'Spanish version of the MainMenuItem Type for the main menu items stored in S3.',
        fields: () => ({
          linkTitle: {
            type: GraphQLString,
            description: 'title of menu item link'
          },
          link: {
            type: GraphQLString,
            description: 'route of menu item'
          }
        })
      }),
      description: 'name of the item'
    }
  })
})
module.exports = MainMenuItemType
