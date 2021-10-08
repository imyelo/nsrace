const Promise = require('bluebird')
const tcpp = require('tcp-ping')

module.exports = function ping (address, timeout) {
  return new Promise((resolve, reject) => {
    tcpp.ping({ address, timeout }, (error, data) => {
      if (error) {
        return reject(error)
      }
      resolve(isNaN(data.avg) ? Infinity : data.avg)
    })
  })
}
