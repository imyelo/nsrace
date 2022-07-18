import unique from 'just-unique'
import dns2 from 'dns2'
import pTimeout from 'p-timeout'

const { UDPClient, DOHClient, Packet } = dns2

const DEFAULT_TIMEOUT = 4 * 1000 // 4s
const DEFAULT_NS = '8.8.8.8'
const DEFAULT_SERVER_PORT = 53

const PROTOCOL = {
  UDP: 'UDP',
  DOH: 'DOH',
}

const createDNSClient = (ns: string, protocol) => {
  const [address, port = DEFAULT_SERVER_PORT] = ns.split(':')
  if (protocol === PROTOCOL.UDP)
    return UDPClient({
      dns: address,
      port: +port,
    })
  if (protocol === PROTOCOL.DOH)
    return DOHClient({
      dns: ns,
    })
  throw new Error('unexpected dns protocol')
}


export const nslookup = async (domain: string, ns = DEFAULT_NS, protocol = PROTOCOL.UDP) => {
  const lookup = createDNSClient(ns, protocol)
  const result = await pTimeout(lookup(domain), DEFAULT_TIMEOUT)
  const ips = result.answers
    .filter(({ type }) => type === Packet.TYPE.A || type === Packet.TYPE.AAAA)
    .map(({ address }) => address)
  return unique(ips)
}
