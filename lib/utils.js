const { isIP } = require('net')

exports.isServerString = function isServerString (server) {
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
