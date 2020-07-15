# Usage

The content API allows for searching of different resources used in the _SBA.gov_ site. To utilize the search hit the relevant endpoint for the AWS Lambda that is running the content API. The endpoint will accept URL parameters. Articles are stored in Cloudsearch, so the content API will make a request to the AWS Cloudsearch Articles Domain using the URL parameters and will return the matching Cloudsearch results. Any invalid parameters will be ignored and not affect the results.

The docs for AWS Cloudsearch Developer Guide can be found here: https://docs.aws.amazon.com/cloudsearch/latest/developerguide

_Note:_ This API only is for `GET` actions. It does not support any create or update actions. Those actions are handled by other services

### Responses

| Status                             | Description
|------------------------------------|------------------
|  HttpStatus.OK                     | For successful results or empty results
|  HttpStatus.INTERNAL_SERVER_ERROR  | When there is an error fetching data
|  HttpStatus.NOT_FOUND              | If the API endpoint is invalid; Unable to find ${type} with id ${id}

### Relationship to AWS API Gateway

API Gateway sits in front of the content api lambda code. The below are the paths that API gateway uses to direct traffic to all the endpoints specified in the API usage in the rest of this file
```
paths:
  /api/content/search/{type}:
    get:
      responses: {}
  /api/content/search/{type}/{id}:
    get:
      responses: {}
```

## Announcements API

Hit the announcements endpoint at `*/announcements.json`

The announcements endpoint pulls and returns the announcements.json from S3.

## Article API

Hit the articles endpoint at `*/articles.json`

The articles endpoint is a middleware resource used to construct a query to the AWS cloudsearch domain for articles. The results will be transformed into an analogous object and returned.

| Parameters (optional) | Description
|-----------------------|------------------
|  searchTerm           | A keyword search. Will search on cloudsearch's `title`, `article_body`, `summary`, and `url` fields.
|  articleCategory      | The category of the article. Articles can be associated with multiple categories. Also accepts a value of `all`
|  program              | The program that artcle is associated with. Articles can be assoicated with multiple programs. Also accepts a value of `all`
|  relatedOffice        | The ID of an office. This will search on cloudsearch's `related_offices` field (articles tagged to a certain office).
|  office               | The ID of an office. This will search on cloudsearch's `office` field (articles authored by a certain office).
|  region               | The locational region an article is associated with. Example value: `Region I`
|  national             | Boolean field that, when `true`, will search on cloudsearch's `region` field for articles containing a `National` region.
|  sortBy               | The field that will be sorted determined by the `order` param. Valid inputs are `Title` and `Authored on Date`. Will default to sort on cloudsearch's `updated` field.
|  order                | The order of the articles based on the `sortBy` param. Will default to descending order. Only accepts `asc` and `desc` as valid.
|  start                | The first index of the matching articles that will be returned
|  end                  | The index after the last matching article that will be returned

Example Request:
```
https://sba.gov/api/content/search/articles.json?searchTerm=foo&category=bar&office=7428?start=0?end=2
```

Example Response
```
{
  count: 25,
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

## Authors API

Hit the authors endpoint at `*/authors.json`

Returns a hardcoded array of author id's. Used to determine what authors should be featured on the `/blogs` webpage.

## Blogs API

#### Search Blogs

Hit the blogs endpoint at `*/blogs.json`

The blogs endpoint pulls, searches, and filters blogs from the blogs.json in S3.

| Parameters (Optional) | Description
|-----------------------|------------------
|  category             | The category of blogs to be included in the results. Excludes results that are listed as a different category
|  author               | The ID of the `person` who wrote the blog
|  office               | The ID of the `office` associated with the blog
|  order                | The order of the results based on the published date. Will default to descending order. Only accepts `asc` and `desc` as valid.
|  start                | The first index of the matching blogs that will be returned
|  end                  | The index after the last matching blog that will be returned

Example Request:
```
https://sba.gov/api/content/search/blogs.json?category=foo&author=12345&office=99999
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
https://sba.gov/api/content/search/blogs/10000.json
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

## Contacts API

Hit the contacts endpoint at `*/contacts.json`

The contacts endpoint pulls, filters, and returns the contacts.json from S3. The endpoint will filter by exact match with key/value pair of any query parameters, if present.

Example Request
```
https://sba.gov/api/content/search/contacts.json?stateServed=Georgia
```

Example Response
```
[
  {
    "id": 2737,
    "type": "contact",
    "category": "Export working capital",
    "city": "Columbus",
    "link": "https://www.synovus.com/local/columbus-ga/",
    "state": "GA",
    "stateServed": "Georgia",
    "streetAddress": "1148 Broadway",
    "zipCode": 31901,
    "title": "Synovus Bank"
  },
  {
    "id": 2738,
    "type": "contact",
    "category": "Export working capital",
    "city": "Atlanta",
    "link": "https://atlanticcapitalbank.com/contact-us",
    "state": "GA",
    "stateServed": "Georgia",
    "streetAddress": "3280 Peachtree Rd Ne, Suite 160",
    "zipCode": 30305,
    "title": "Atlantic Capital Bank"
  }
]
```

## Courses API

#### Search Courses

Hit the courses endpoint at `*/courses.json`

The courses endpoint pulls, searches, and filters courses from the courses.json in S3.

| Parameters (optional) | Description
|-----------------------|------------------
| businessStage         | The category of courses to be included in the results (value will be in `courseCategory` of the results). Excludes results that are listed as a different category. Also accepts a value of `All`
| sortBy                | Accepts a value of `Title` and, if present, will sort results by course titles in alphabetical order

Example Request:
```
https://sba.gov/api/content/search/courses.json?businessStage=Launch%20your%20business
```

Example Response:
```
[
  {
    "body": "<p>This self-paced training exercise is an introduction to financing options for your business.</p>",
    "courseCategory": [
      "Plan your business",
      "Launch your business"
    ],
    "courseMaterials": [
      {
        "url": "/sites/default/files/2019-12/Worksheet%20-%20Financing%20Options%20for%20Small%20Business.pdf",
        "description": "Financing Options Worksheet"
      }
    ],
    "courseType": "HTML5",
    "courseUrl": {
      "url": "/media/training/financing_options/story_html5.html",
      "title": ""
    },
    "image": {
      "url": "/sites/default/files/2018-01/shutterstock_648969952_500.jpg",
      "alt": "Financing Options for Small Businesses",
      "width": 500,
      "height": 331
    },
    "summary": "An introduction to financing options for your small business.",
    "transcript": "<p>Welcome to SBA’s online training course: Financing Options for Small Businesses.</p>",
    "type": "course",
    "title": "Financing Options for Small Businesses",
    "id": 5884,
    "updated": 1588256653,
    "created": 1516898917,
    "langCode": "en",
    "url": "/course/financing-options-small-businesses"
  },
  {
    "body": "<p>This course provides a basic overview of marketing for small business owners who are looking to reach a broader customer base and expand their markets.</p>",
    "courseCategory": [
      "Launch your business",
      "Manage your business"
    ],
    "courseMaterials": [
      {
        "url": "/sites/default/files/2019-12/Marketing101_Worksheet-2019-FormFields.pdf",
        "description": "Marketing 101: Worksheet"
      }
    ],
    "courseType": "HTML5",
    "courseUrl": {
      "url": "/media/training/marketing-101/story_html5.html",
      "title": ""
    },
    "image": {
      "url": "/sites/default/files/2018-01/shutterstock_665356801_500.jpg",
      "alt": "Marketing 101: A Guide to Winning Customers",
      "width": 500,
      "height": 333
    },
    "summary": "An overview of marketing for small business owners who are looking to reach a broader customer base and expand their markets.",
    "transcript": "<p>The Marketing 101: A Guide to Winning Customers course is comprised of five topics.</p>",
    "type": "course",
    "title": "Marketing 101: A Guide to Winning Customers",
    "id": 5888,
    "updated": 1588256871,
    "created": 1516901819,
    "langCode": "en",
    "url": "/course/marketing-101-guide-winning-customers"
  }
]
```

#### Fetch a Course

To get an individual course  make request at `*/course.json`.

Must specifiy the pathname query parameter.

| Parameters | Description
|------------|------------------
|  pathname  | ***Required*** The `url` (_not_ `courseUrl`) associated with the particular course

Example Request
```
https://sba.gov/api/content/search/course.json?pathname=%2Fcourse%2Fbuying-business
```
Example Response
```
{
  "body": "<p>This self-paced training provides an overview of the process of buying a business and provides resources to help you decide if buying a business is right for you.</p>",
  "courseCategory": [
    "Plan your business"
  ],
  "courseMaterials": {},
  "courseType": "HTML5",
  "courseUrl": {
    "url": "/media/training/buying-business/story_html5.html",
    "title": ""
  },
  "image": {
    "url": "/sites/default/files/2018-02/shutterstock_274686497_500.jpg",
    "alt": "Buying a Business",
    "width": 500,
    "height": 334
  },
  "summary": "The process of buying a business and resources to help decide if buying a business is right for you.",
  "transcript": "<p>Welcome to SBA's online training course: Buying a Business</p>",
  "type": "course",
  "title": "Buying a Business",
  "id": 5980,
  "updated": 1588257490,
  "created": 1518205996,
  "langCode": "en",
  "url": "/course/buying-business",
  "isFound": true
}
```

## Disaster API

Hit the disaster endpoint at `*/disaster.json`

The disaster endpoint pulls and returns the disaster.json from S3.

## Documents API

Hit the documents endpoint at `*/documents.json`

The documents endpoint pulls, filters/sorts, and returns the documents.json from S3.

| Parameters (Optional) | Description
|-----------------------|------------------
|  url                  | The url associated with the particular document
|  activity             | The activity that is associated with the document. Documents can have more than one activity.
|  program              | The program that the document is assoicated with. Documents can be associated with more than one program
|  documentType         | The type of the document. This is an exact string match
|  searchTerm           | A keyword search on the document title and document ID number fields.
|  sortBy               | Determines the order of the documents that are returned. Valid inputs are `Title`, `Number`, `documentIdNumber`, `Last Updated`, and `Effectve Date`. Will not do any sorting if no valid `sortBy` parameter is provided.
|  office               | The ID for the office that authored the document. Not all documents will be associated with an office and documents may only be associated with one office
|  start                | The first index of the matching documents that will be returned
|  end                  | The index after the last matching document that will be returned

Example Request
```
https://sba.gov/api/content/search/documents.json?searchTerm=foo&activity=bar
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

## Lenders API

Hit the lenders endpoint at `*/lenders.json`

The lenders endpoint is a middleware resource used to construct a query to the AWS cloudsearch domain for lenders. Returns results directly from clousearch.

| Parameters         | Description
|--------------------|------------------
|  address           | The zip code to search for nearby lenders. If both `address` and `mapCenter` are passed in, it will search by the `address`
|  lenderName        | Searches coudsearch's `lender_name` field
|  mapCenter         | Comma separated latitude and longitude coordinates to search for nearby lenders. If both `address` and `mapCenter` are passed in, it will search by the `address`
|  hasFiled2019Taxes | Accepts `true` to search for rapid (fast track) lenders. If empty or any value except `true`, it will return ALL lenders (both rapid and non-rapid)
|  pageSize          | The number of results to return per page (utilized for pagination on the front end)
|  start             | The index of the matching lenders that will be returned, where the first index is `0`. Can be utilized in conjunction with `pageSize` for pagination on the front end

_Note:_ The search will return ALL lenders, but will sort lenders by distance to the specified address or map center, if present.

Example Request:
```
https://sba.gov/api/content/search/lenders.json?address=12345&mapCenter=mapCenter=39.283041199676305%2C-76.61091513698732&hasFiled2019Taxes=true&pageSize=5&start=0
```

Example Response:
```
{
  "found": 2,
  "start": 0,
  "hit": [
    {
      "id": "7172295",
      "fields": {
        "geolocation": [
          "39.27679,-76.61234"
        ],
        "city": [
          "BALTIMORE"
        ],
        "address": [
          "1111 Light St"
        ],
        "zipcode": [
          "21230"
        ],
        "is_fast_track": [
          "1"
        ],
        "bank_phone": [
          "410-783-1024"
        ],
        "state": [
          "MD"
        ],
        "lender_name": [
          "Manufacturers and Traders Trust Company"
        ]
      },
      "exprs": {
        "distance": 0.7800699910588602
      }
    },
    {
      "id": "5534630",
      "fields": {
        "geolocation": [
          "39.277523,-76.61246"
        ],
        "city": [
          "Baltimore"
        ],
        "address": [
          "1046 Light St"
        ],
        "zipcode": [
          "21230"
        ],
        "is_fast_track": [
          "0"
        ],
        "bank_phone": [
          "410-752-7481"
        ],
        "state": [
          "MD"
        ],
        "lender_name": [
          "Bank of America, National Association"
        ]
      },
      "exprs": {
        "distance": 0.7920915372801751
      }
    }
  ]
}
```

## Main Menu API

Hit the main menu endpoint at `*/mainMenu.json`

The main menu endpoint pulls and returns the mainMenu.json from S3.

## Node API

Hit the node endpoint at `*/node.json`

The node endpoint gets the json for the specified id from S3.

| Parameters | Description
|------------|------------------
|  id        | ***Required*** Accepts a number

Example Request
```
https://sba.gov/api/content/search/node.json?id=7766
```

Example Response
```
{
  "bio": "<p>Mr. Larry Stubblefield is the Associate Administrator for the Office of Veterans Business Development (OVBD) at the U.S. Small Business Administration (SBA).</p>",
  "emailAddress": {},
  "fax": "202-205-7292",
  "firstName": "Larry",
  "highResolutionPhoto": "/sites/default/files/2019-02/larry_stubblefield.jpg",
  "lastName": "Stubblefield",
  "office": 15840,
  "phone": "202-205-6773",
  "picture": {
    "alt": "Larry Stubblefield",
    "src": "/sites/default/files/2019-02/bio-larry-stubblefield.jpg"
  },
  "shortBio": "Associate Administrator",
  "title": "Associate Administrator ",
  "type": "person",
  "url": "/person/larry-stubblefield",
  "name": "Larry Stubblefield",
  "id": 7766,
  "updated": 1589564851,
  "created": 1536607523,
  "langCode": "en"
}
```

## Nodes API

Hit the nodes endpoint at `*/nodes.json`

The nodes endpoint pulls and returns the nodes.json from S3.

## Offices API

Hit the offices endpoint at `*/offices.json`

The offices endpoint is a middleware resource used to construct a query to the AWS cloudsearch domain for offices. Returns results directly from clousearch.

| Parameters (Optional) | Description
|-----------------------|------------------
|  q                    | Accepts a string and queries cloudsearch's `title`, `location_name`, and `office_type` fields
|  address              | The zip code to search for nearby offices. If both `address` and `mapCenter` are passed in, it will search by the `address`
|  mapCenter            | Comma separated latitude and longitude coordinates to search for nearby offices. If both `address` and `mapCenter` are passed in, it will search by the `address`
|  service              | Filters against cloudsearch's `office_service` field for a match
|  type                 | Filters against cloudsearch's `office_type` field for a match
|  pageSize             | The number of results to return per page (utilized for pagination on the front end)
|  start                | The index of the matching offices that will be returned, where the first index is `0`. Can be utilized in conjunction with `pageSize` for pagination on the front end

_Note:_ The search (unless filtered by type or service parameters) will return ALL offices, but will sort offices by distance to the specified address or map center, if present.

Example Request:
```
https://www.example.com/offices.json?pageSize=5&start=0&type=Certified%20Development%20Company&q=business
```

Example Response:
```
{
  "found": 54,
  "start": 0,
  "hit": [
    {
      "id": "16140",
      "fields": {
        "location_city": [
          "Liberty Township"
        ],
        "location_phone_number": [
          "513-777-2225"
        ],
        "location_zipcode": [
          "45044"
        ],
        "location_state": [
          "OH"
        ],
        "location_name": [
          "Access Business Development & Finance Inc."
        ],
        "title": [
          "Access Business Development & Finance Inc."
        ],
        "office_type": [
          "Certified Development Company"
        ],
        "geolocation": [
          "39.376635,-84.366275"
        ],
        "type": [
          "office"
        ],
        "location_street_address": [
          "7370 Liberty One Dr., "
        ]
      }
    },
    {
      "id": "17691",
      "fields": {
        "location_city": [
          "Brownsville"
        ],
        "location_phone_number": [
          "956-546-4020"
        ],
        "location_zipcode": [
          "78520"
        ],
        "location_name": [
          "Business Development Fund of Texas"
        ],
        "location_fax": [
          "956-548-6134"
        ],
        "location_state": [
          "TX"
        ],
        "title": [
          "Brownsville Local Development Company, Inc."
        ],
        "office_type": [
          "Certified Development Company"
        ],
        "geolocation": [
          "25.938965,-97.510299"
        ],
        "type": [
          "office"
        ],
        "location_street_address": [
          "2335 Central Blvd, "
        ]
      }
    }
  ]
}
```

## Offices Raw API

Hit the offices raw endpoint at `*/officesRaw.json`

The offices raw endpoint pulls and returns the offices.json from S3.

## Persons API

Hit the persons endpoint at `*/persons.json`

The persons endpoint pulls the persons.json from S3. For each person, the code adds the office name and type to the `office` key. It will then sort the array or persons alphabetically by last name and returns the results.

## Search API

Hit the search endpoint at `*/search.json`

The search endpoint is a middleware resource used to construct a query to the AWS cloudsearch domain associated with a global search of the site. Returns results directly from clousearch.

| Parameters    | Description
|---------------|------------------
|  term         | ***Required*** Accepts a string to search cloudsearch's fields
|  pageSize     | Accepts a number. Will return an array of results equal to pageSize value
|  start        | Accepts a number. Indicates what index the returned results should start with. Filters out results with an index lower than the indicated value

## Site Map API

Hit the site map endpoint at `*/siteMap.json`

The site map endpoint pulls and returns the siteMap.json from S3.

## Suggested Routes API

Hit the site map endpoint at `*/suggestedRoutes.json`

Returns a hardcoded array of suggested routes. Used to suggest alternate routes to users.

## Suggestions API

Hit the site map endpoint at `*/suggestions.json`

Middleware to get a list of suggested lender names in the cloudsearch domain for lenders based on a passed in query string.

| Parameters    | Description
|---------------|------------------
|  lenderName   | ***Required*** Accepts a string

Example Request
```
https://sba.gov/api/content/search/suggestions.json?lenderName=PNC
```

Example Response
```
[
  "Pnc",
  "Pnc Bank",
  "Pnc Bank (atm)",
  "Pnc Bank Drive-thru",
  "Pnc Bank, National Association",
  "Pnc Investor Center"
]
```

## Taxonomys API

Hit the taxonomys endpoint at `*/taxonomys.json`

The taxonomys endpoint pulls, filters, and returns the taxonomys.json from S3.

| Parameters (optional) | Description
|-----------------------|------------------
|  names                | A single name of the taxonomy or a comma separated list of the names of taxonomys to be returned.

Example Request
```
https://sba.gov/api/content/search/taxonomys.json?names=blogCategories,articleCategory
```

Example Response
```
[
  {
    "name": "blogCategories",
    "terms": [
      "SBA News and Views",
      "Industry Word",
      "Success Story"
    ]
  },
  {
    "name": "articleCategory",
    "terms": [
      "Congressional Testimony",
      "Disaster Press Release",
      "Media advisory",
      "Offering Circular - Debenture",
      "Speech",
      "Offering Circular - Participating Security",
      "Press release",
      "Policy notice",
      "Information notice",
      "Procedural notice"
    ]
  }
]
```
