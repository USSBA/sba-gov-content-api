'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const expressGraphQL = require('express-graphql')
const GraphQLSchema = require('./schema')
// const {
//     ENVIRONMENT
// } = process.env
const app = express()
app.use(bodyParser.json({ limit: '50mb' }))
app.use(
  '/api/content/search/graphql',
  expressGraphQL(() => {
    return {
      graphiql: true, // ENVIRONMENT !== 'prod',
      schema: GraphQLSchema
    }
  })
)
module.exports = app
