# Usage

The content API allows for searching of different resources used in the _SBA.gov_ site. To utilize the search hit the relevant endpoint for the AWS Lambda that is running the content API. The endpoint will accept URL parameters. Articles are stored in Cloudsearch, so the content API will make a request to the AWS Cloudsearch Articles Domain using the URL parameters and will return the matching Cloudsearch results. Any invalid parameters will be ignored and not affect the results.

The docs for AWS Cloudsearch Developer Guide can be found here: https://docs.aws.amazon.com/cloudsearch/latest/developerguide

_Note:_ This API only is for `GET` actions. It does not support any create or update actions. Those actions are handled by other services

## Article API
Hit the articles endpoint at `*/articles.json`

| Parameters       | Description
|------------------|------------------
|  searchTerm      | A keyword search.
|  articleCategory | The category of the article. Articles can be associated with multiple categories
|  program         | The program that artcle is associated with. Articles can be assoicated with multiple programs
|  type            | The type of resource being accessed.
|  relatedOffice   | The ID of an office. This will search Cloudsearch on the `related_offices` field (articles tagged to a certain office).
|  office   | The ID of an office. This will search Cloudsearch on the `office` field (articles authored by a certain office).
|  region          | The region of an office.
|  national        | Boolean field that, when `true`, will search Cloudsearch on the `region` field for articles containing a `National` region. This will search Cloudsearch on the related_offices field (artices tagged to a certain office) AND the office field (articles authored by a certain office).
|  sortBy          | The field that will be sorted determined by the `order` param. Valid inputs are `Title` and `Authored on Date`. Will default to sort on the `updated` field.
|  order           | The order of the articles based on the `sortBy` param. Will default to descending order. Only accepts `asc` and `desc` as valid.
|  start           | The first index of the matching articles that will be returned
|  end             | The index after the last index of the returned matching articles

Example Request:
```
  https://example.com/articles.json?searchTerm=foo&category=bar&office=7428
```

Example Response
```
{
  count: 2,
  items: [
      {
      'articleId': {},
      'category': [
        'example category'
      ],
      'mediaContact': {},
      'office': 7428,
      'officeLink': {
        'url': '/offices/headquarters/oit',
        'title': 'Office of International Trade'
      },
      'file': {},
      'programs': [],
      'summary': 'A basic article summary',
      'type': 'article',
      'title': 'Basic SBA article',
      'id': 1,
      'updated': 1558716617,
      'created': 1509566328,
      'langCode': 'en',
      'url': '/article/2017/nov/01/list-useacs-sba-staff'
    },
    {
      'articleId': {},
      'category': [
        'example category'
      ],
      'mediaContact': {},
      'office': 7428,
      'officeLink': {
        'url': '/offices/headquarters/oit',
        'title': 'Office of International Trade'
      },
      'file': {},
      'programs': [],
      'summary': 'A basic article summary',
      'type': 'article',
      'title': 'Basic SBA article',
      'id': 2,
      'updated': 1558716617,
      'created': 1509566328,
      'langCode': 'en',
      'url': '/article/2017/nov/01/list-useacs-sba-staff'
    }
  ]
}
```

## Blog API

#### Search Blogs
Hit the blogs endpoint at `*/blogs.json`

| Parameters | Description
|------------|------------------
|  category  | The category of blogs to be included in the results. Excludes results that are listed as a different category
|  author    | The ID of the `person` who wrote the blog
|  office    | The ID of the `office` associated with the blog
|  order     | The order of the results based on the published date. Will default to descending order. Only accepts `asc` and `desc` as valid.
|  start     | The first index of the matching blogs that will be returned
|  end       | The index after the last matching blog that will be returned

Example Request:
```
  https://example.com/blogs.json?category=foo&author=12345&office=99999
```

Example Response:
```
{
  total: 2,
  blogs: [
    {
      'author': 12345,
      'blogBody': [
        {
          'id': 11111,
          'type': 'blogPost',
          'blogSectionImage': {},
          'blogSectionText': 'Context'
        }
      ],
      'blogTags': 'Franchising',
      'blogCategory': 'foo',
      'office': 99999,
      'summary': 'How to Get Past the Fear of Buying a Franchise',
      'type': 'blog',
      'title': 'How to Get Past the Fear of Buying a Franchise',
      'id': 10000,
      'updated': 1555099825,
      'created': 1554895800,
      'langCode': 'en',
      'url': '/blogs/first-url'
    },
    {
      'author': 12345,
      'blogBody': [
        {
          'id': 22222,
          'type': 'blogPost',
          'blogSectionImage': {},
          'blogSectionText': 'Context'
        }
      ],
      'blogTags': 'Franchising',
      'blogCategory': 'foo',
      'office': 99999,
      'summary': 'How to Get Past the Fear of Buying a Franchise',
      'type': 'blog',
      'title': 'How to Get Past the Fear of Buying a Franchise',
      'id': 10001,
      'updated': 1555099825,
      'created': 1554895802,
      'langCode': 'en',
      'url': '/blogs/second-url'
    }
  ]
}
```

#### Fetch a Blog
To get an individual blog post make request at `*/blogs/{:id}.json`. This endpoint does not accept any other parameters.

Example Request
```
  https://example.com/blogs/10000.json
```
Example Response
```
{
  'author': 12345,
  'blogBody': [
    {
      'id': 11111,
      'type': 'blogPost',
      'blogSectionImage': {},
      'blogSectionText': 'Context'
    }
  ],
  'blogTags': 'Franchising',
  'blogCategory': 'foo',
  'office': {},
  'summary': 'How to Get Past the Fear of Buying a Franchise',
  'type': 'blog',
  'title': 'How to Get Past the Fear of Buying a Franchise',
  'id': 10000,
  'updated': 1555099825,
  'created': 1554895800,
  'langCode': 'en',
  'url': '/blogs/first-url'
}
```

## Documents API

Hit the documents endpoint at `*/documents.json`

| Parameters    | Description
|---------------|------------------
|  url          | The url associated with the particular document
|  activity     | The activity that is associated with the document. Documents can have more then one activity.
|  program      | The program that the document is assoicated with. Documents can be associated with more then one program
|  documentType | The type of the document. This is an exact string match
|  searchTerm   | A keyword search on the document title and document ID number fields.
|  sortBy       | Determines the order of the documents that are returned. Valid inputs are `Title`, `Number`, `documentIdNumber`, `Last Updated`, and `Effectve Date`. Will not do any sorting if no valid `sortBy` parameter is provided.
| office        | The ID for the office that authored the document. Not all documents will be associated with an office and documents may only be associated with one office
|  start        | The first index of the matching documents that will be returned
|  end          | The last index of the matching documents that will be returned

Example Request
```
https://example.com/documents.json?searchTerm=foo&activity=bar
```

Example Response
```
{
  count: 2,
  items: [
    {
      'activitys': [
        'activity'
      ],
      'documentIdNumber': '5000-4021',
      'documentIdType': 'example document type',
      'files': [
        {
          'id': 1111,
          'type': 'docFile',
          'effectiveDate': '2017-08-28',
          'expirationDate': null,
          'fileUrl': '/sites/default/files/2017-09/5000-4021.pdf',
          'version': '1'
        }
      ],
      'officeLink': {
        'url': '/offices/headquarters/oca',
        'title': 'Office of Capital Access'
      },
      'ombNumber': {},
      'programs': [
        '7(a)',
        'CDC/504',
        'Microlending',
        'Community Advantage',
        'Disaster'
      ],
      'summary': 'SBA is providing deferments for SBA 7(a) and 504 Business Loans, Microloans, and Disaster Loans for businesses adversely affected by Hurricane Harvey.',
      'type': 'document',
      'title': 'SBA Provides Loan Deferments in Hurricane Harvey Affected Areas',
      'id': 1111,
      'updated': 1512075693,
      'created': 1504815259,
      'langCode': 'en',
      'url': '/document/policy-notice-5000-4021-sba-provides-loan-deferments-hurricane-harvey-affected-areas'
    },
    {
      'activitys': [
        'contracting stuff'
      ],
      'documentIdNumber': '5000-4021',
      'documentIdType': 'Policy notice',
      'files': [
        {
          'id': 1112,
          'type': 'docFile',
          'effectiveDate': '2017-08-28',
          'expirationDate': null,
          'fileUrl': '/sites/default/files/2017-09/5000-4021.pdf',
          'version': '1'
        }
      ],
      'officeLink': {
        'url': '/offices/headquarters/oca',
        'title': 'Office of Capital Access'
      },
      'ombNumber': {},
      'programs': [
        '7(a)',
        'CDC/504',
        'Microlending',
        'Community Advantage',
        'Disaster',
        'Test program'
      ],
      'summary': 'SBA is providing deferments for SBA 7(a) and 504 Business Loans, Microloans, and Disaster Loans for businesses adversely affected by Hurricane Harvey.',
      'type': 'document',
      'title': 'SBA Provides Loan Deferments in Hurricane Harvey Affected Areas',
      'id': 1112,
      'updated': 1512075693,
      'created': 1504815259,
      'langCode': 'en',
      'url': '/document/policy-notice-5000-4021-sba-provides-loan-deferments-hurricane-harvey-affected-areas'
    }
  ]
}
```
## Events API

Access the events endpoint at `*search/events.json`. Will search against events saved in an AWS Cloudsearch instance.

| Parameters    | Description
|---------------|------------------
|  q            | The search query being used to filter events bases on name, summary, or description
|  address      | The zip code being used in conjuction with the `distance` parameter to find events in a specific area. This is the zip code in the center of the area
|  distance     | The size of the area to look for events in. Filters for events within a bounding box based on distance in miles and centered on the `address` parameter
|  dateRange    | The date range for the `start_datetime`. Date/time must be converted to UTC time. This query parameter can accept either a single starting date or a date range separated by `%2C` (unicode comma). If no date range is given, starting date range is based on current time to exclude old events.
|  office       | The ID of SBA office that the event is associated with. Use the office ID to limit the search results to only events associated with that office. Will match against the `host_office` field in cloudsearch
|  pageSize     | The number of events to return in the response
|  start        | The first index of the matching documents that will be returned
|  end          | The last index of the matching documents that will be returned

Example Request
```
http://example.com/search/events.json?q=foo&office=12345&address=12345&distance=20?dateRange=2019-08-08T14%3A38%3A53Z%2C2019-09-06T23%3A59%3A59Z
```

Example Response
```
{
  "found": 1,
  "start": 0,
  "hit": [
    {
      "id": "19164",
      "fields": {
        "geolocation": [
          "44.262804,-88.409144"
        ],
        "event_type": [
          "Online"
        ],
        "timezone": [
          "Eastern time zone"
        ],
        "organizer_email": [
          "organizingolivia@email.com"
        ],
        "location_city": [
          "Baltimore"
        ],
        "location_name": [
          "Spark Baltimore"
        ],
        "start_datetime": [
          "2019-08-31T16:00:00Z"
        ],
        "location_street_address": [
          "8 Market Place"
        ],
        "description": [
          "There will be an event. That is all."
        ],
        "host_office": [
          "12345"
        ],
        "is_free": [
          "0"
        ],
        "organizer_phone_number": [
          "100-200-3000"
        ],
        "location_state": [
          "MD"
        ],
        "location_zipcode": [
          "21202"
        ],
        "is_recurring": [
          "0"
        ],
        "name": [
          "V5 Test Event (non-recurring)"
        ],
        "language": [
          "en"
        ],
        "end_datetime": [
          "2019-08-31T22:00:00Z"
        ],
        "status": [
          "Approved"
        ],
        "summary": [
          "This is the event summary section."
        ],
        "registration_link": [
          "http://registerhere.com"
        ],
        "organizer_name": [
          "Organizing Olivia"
        ]
      }
    }
  ]
}
```