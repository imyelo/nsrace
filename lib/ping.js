const Promise = require('bluebird')
const tcpp = require('tcp-ping')

module.exports = function ping (address) {
  return new Promise((resolve, reject) => {
    tcpp.ping({ address }, (error, data) => {
      if (error) {
        return reject(error)
      }
      resolve(data.avg)
    })
  })
}
