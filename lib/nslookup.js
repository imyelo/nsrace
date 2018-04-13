const Promise = require('bluebird')
const unique = require('just-unique')
const dns = require('native-dns')

const DEFAULT_NS = '8.8.8.8'
const DEFAULT_SERVER_PORT = 53

module.exports = function nslookup (domain, ns = DEFAULT_NS) {
  return new Promise((resolve, reject) => {
    let ips = []

    const [ address, port = DEFAULT_SERVER_PORT ] = ns.split(':')

    const question = dns.Question({
      name: domain,
      type: 'A',
    })

    const request = dns.Request({
      question,
      server: {
        address,
        port,
        type: 'udp',
      },
    })

    request.on('timeout', function () {
      reject(new Error('Timeout in making request'))
    })

    request.on('message', function (error, message) {
      if (error) {
        return reject(error)
      }
      ips = ips.concat(message.answer.filter(({ type }) => type === dns.consts.NAME_TO_QTYPE.A).map(({ address }) => address))
    })

    request.on('end', function () {
      resolve(unique(ips))
    })

    request.send()
  })
}
