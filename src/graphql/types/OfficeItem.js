'use strict'
const GraphQL = require('graphql')
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} = GraphQL
console.log('F')
const OfficeItemType = new GraphQLObjectType({
  name: 'OfficeItem',
  description: 'OfficeItemType Type for the office items stored in S3.',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'ID of the item'
    },
    alternateLocations: {
      type: new GraphQLList(GraphQLInt),
      description: "the ids of this office's satellite offices"
    },
    areasServed: {
      type: GraphQLString,
      description: 'description of the geographic locations that this office serves'
    },
    bannerImage: {
      type: GraphQLString,
      description: 'office banner image file name'
    },
    hoursOfOperation: {
      type: GraphQLString,
      description: 'description of the hours of operation'
    },
    location: {
      type: new GraphQLObjectType({
        name: 'OfficeLocationItem',
        description: 'office item relational object',
        fields: () => ({
          id: {
            type: GraphQLID,
            description: 'id of the office location'
          },
          type: {
            type: GraphQLString,
            description: 'office item relationahl object type'
          },
          city: {
            type: GraphQLString,
            description: 'city of office location'
          },
          email: {
            type: GraphQLString,
            description: 'email of office location'
          },
          fax: {
            type: GraphQLString,
            description: 'fax number of office location'
          },
          geocode: {
            type: new GraphQLObjectType({
              name: 'OfficeGeocodeItem',
              description: 'office geocode item',
              fields: () => ({
                id: {
                  type: GraphQLID,
                  description: 'id of the location'
                },
                type: {
                  type: GraphQLString,
                  description: 'office item relational object type'
                },
                latitude: {
                  type: GraphQLString,
                  description: 'geolocation latitude'
                },
                longitude: {
                  type: GraphQLString,
                  description: 'geolocation longitude'
                }
              })
            }),
            description: 'geocode of the office location'
          },
          hoursOfOperation: {
            type: GraphQLString,
            description: 'description of the hours of operation'
          },
          name: {
            type: GraphQLString,
            description: 'name of office location'
          },
          phoneNumber: {
            type: GraphQLString,
            description: 'phone number of office location'
          },
          state: {
            type: GraphQLString,
            description: 'u.s. state of office'
          },
          streetAddress: {
            type: GraphQLString,
            description: 'street address of office location'
          },
          zipCode: {
            type: GraphQLString,
            description: 'zip code of office location'
          }
        })
      }),
      description: "this office's locations"
    },
    mediaContact: {
      type: GraphQLInt,
      description: 'id of the office media contact object'
    },
    office: {
      type: GraphQLInt,
      description: "id of this office's parent office"
    },
    officeLeadership: {
      type: new GraphQLList(GraphQLInt),
      description: 'list of contact ids'
    },
    officeService: {
      type: new GraphQLList(GraphQLString),
      description: 'a list of offices services'
    },
    officeServices: {
      type: GraphQLString,
      description: 'a description of offices services'
    },
    officeType: {
      type: GraphQLString,
      description: 'office type as described by office'
    },
    pims: {
      type: new GraphQLObjectType({
        name: 'PimsOfficeItem',
        description: 'pims data object',
        fields: () => ({
          id: {
            type: GraphQLString,
            description: 'id of the pims office'
          },
          type: {
            type: GraphQLString,
            description: 'type of pims office'
          },
          location: {
            type: GraphQLInt,
            description: 'id of the office location'
          }
        })
      }),
      description: 'office pims data'
    },
    region: {
      type: GraphQLString,
      description: 'region of the office'
    },
    //  relatedDisaster: {
    //  type: GraphQLString
    //  description: 'region of the office'
    // }
    summary: {
      type: GraphQLString,
      description: 'summary of the office'
    },
    twitterLink: {
      type: GraphQLString,
      description: 'twitter url of the office'
    },
    website: {
      type: new GraphQLObjectType({
        name: 'WebsiteItem',
        description: 'website item',
        fields: () => ({
          url: {
            type: GraphQLString,
            description: 'url of office'
          },
          title: {
            type: GraphQLString,
            description: 'title for url of office'
          }
        })
      }),
      description: 'website data for this office'
    },
    type: {
      type: GraphQLString,
      description: 'type of this object'
    },
    title: {
      type: GraphQLString,
      description: 'title of this office'
    },
    updated: {
      type: GraphQLInt,
      description: 'the date when this office object was updated'
    },
    created: {
      type: GraphQLInt,
      description: 'the date when this office object was created'
    },
    langCode: {
      type: GraphQLString,
      description: 'the language of this object data'
    }
  })
})
module.exports = OfficeItemType
