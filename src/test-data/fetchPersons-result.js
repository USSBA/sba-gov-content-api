const officeA = {
  'bio': {},
  'emailAddress': 'Robert.Blaney@sba.gov',
  'fax': {},
  'firstName': 'Robert',
  'highResolutionPhoto': {},
  'lastName': 'Blaney',
  'phone': '602-745-7222',
  'picture': {},
  'title': 'District Director',
  'type': 'person',
  'name': 'Robert J. Blaney',
  'id': 6484,
  'updated': 1551901537,
  'created': 1527675686,
  'langCode': 'en',
  'url': '/person/robert-j-blaney',
  'office': {
    id: 6388,
    name: 'Arizona District Office',
    type: 'SBA District Office'
  }
}

const officeB = {
  'bio': {},
  'emailAddress': 'thomas.todt@sba.gov',
  'fax': '202-292-3808 ',
  'firstName': 'Thomas',
  'highResolutionPhoto': {},
  'lastName': 'Todt',
  'phone': '205-290-7009',
  'picture': {},
  'title': 'District Director',
  'type': 'person',
  'name': 'Thomas A. Todt',
  'id': 6375,
  'updated': 1551482106,
  'created': 1526585495,
  'langCode': 'en',
  'url': '/person/thomas-todt',
  'office': {
    id: 6386,
    name: 'Alabama District Office',
    type: 'SBA District Office'
  }
}
const ascendingOrder = [officeA, officeB]
const descendingOrder = [officeB, officeA]

module.exports.ascendingOrder = ascendingOrder
module.exports.descendingOrder = descendingOrder
