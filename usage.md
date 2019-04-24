# Usage

## Blog API

#### Search Blogs
To search for  blogs using the content API you must hit the `*/blogs` endpoint for the lambda that is running the content API. The API accepts URL query parameters and will return and array of blogs that match the search parameters. Invalid parameters will be ignored.

Example Request:
```
  https://example.com/blogs?category=foo&author=12345
```

Example Response:
```
[
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
    'office': {},
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
```

| Parameters | Description
|------------|------------------
|  category  | The category of blogs to be included in the results. Excludes results that are listed as a different category
|  author    | The ID of the `person` who wrote the blog
|  order     | The order of the results based on the published date. Will default to descending order. Only accepts `asc` ad `desc` as valid.
|  start     | The first index of the matching blogs that will be returned
|  end       | The last index of the matching blogs that will be returned

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
