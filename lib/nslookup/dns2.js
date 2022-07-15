const Promise = require('bluebird')
const unique = require('just-unique')
const { UDPClient, DOHClient, Packet } = require('dns2')

const DEFAULT_TIMEOUT = 4 * 1000 // 4s
const DEFAULT_NS = '8.8.8.8'
const DEFAULT_SERVER_PORT = 53

const PROTOCOL = {
  UDP: 'UDP',
  DOH: 'DOH',
}

const createDNSClient = (ns, protocol) => {
  const [ address, port = DEFAULT_SERVER_PORT ] = ns.split(':')
  if (protocol === PROTOCOL.UDP) return UDPClient({
    dns: address,
    port,
  })
  if (protocol === PROTOCOL.DOH) return DOHClient({
    dns: ns,
  })
  throw new Error('unexpected dns protocol')
}

const nslookup = (domain, ns = DEFAULT_NS, protocol = PROTOCOL.UDP) => Promise.resolve().then(async () => {
  const lookup = createDNSClient(ns, protocol)
  const result = await lookup(domain)
  const ips = result.answers.filter(({ type }) => type === Packet.TYPE.A || type === Packet.TYPE.AAAA).map(({ address }) => address)
  return unique(ips)
}).timeout(DEFAULT_TIMEOUT)

module.exports = nslookup
