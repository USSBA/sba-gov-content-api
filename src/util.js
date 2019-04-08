function splitAsObject (string) {
  let split = string.split('.')
  let first = split[0].split('/')[1]
  let second = split[1]
  return { first, second }
}

module.exports.splitAsObject = splitAsObject
