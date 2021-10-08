const { isIP } = require('net')

exports.checkIsServerString = function checkIsServerString (server) {
  let matched = server.match(/^([^\:]*)(?:\:(\d*))?$/)
  if (!matched) {
    return false
  }
  let [ , ip ] = matched
  if (!isIP(ip)) {
    return false
  }
  return true
}

exports.checkIsDomainURI = function checkIsDoaminURI (url) {
  return !url.includes('/')
}
