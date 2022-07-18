import Bluebird from 'bluebird'
import unique from 'just-unique'
import dns from 'native-dns'

const DEFAULT_NS = '8.8.8.8'
const DEFAULT_SERVER_PORT = 53

export const nslookup = (domain: string, ns: string = DEFAULT_NS): Bluebird<string[]> => {
  return new Bluebird((resolve, reject) => {
    const ips: string[] = []

    const [address, port = DEFAULT_SERVER_PORT] = ns.split(':')

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

    request.on('timeout', () => {
      reject(new Error(`Timeout in making request.\nDNS Service: ${ns}\nDomain: ${domain}`))
    })

    request.on('message', (error, message) => {
      if (error) {
        reject(error)
        return
      }
      ips.push(
        ...message.answer.filter(({ type }) => type === dns.consts.NAME_TO_QTYPE.A).map(({ address }) => address)
      )
    })

    request.on('end', () => {
      resolve(unique(ips))
    })

    request.send()
  })
}
