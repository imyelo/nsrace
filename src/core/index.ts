import Promise from 'bluebird'
import { URL } from 'node:url'
import unique from 'just-unique'
import flatten from 'just-flatten-it'
import { config } from './config.js'
import nslookup from './nslookup/index.js'
import { fetch } from './speed/fetch.js'
import { ping } from './speed/ping.js'
import { checkIsDomainURI } from './utils.js'

const noop = (...args: unknown[]) => {}
const noopProgress = (...args: unknown[]) => {}
noopProgress.success = (...args: unknown[]) => {}
noopProgress.warn = (...args: unknown[]) => {}

export const run = async ({ uri, pingTimeout, fetchTimeout, progress = noopProgress, verbose = noop }) => {
  const isDomainURI = checkIsDomainURI(uri)
  const domain = isDomainURI ? uri : new URL(uri).hostname

  const servers = config.get('servers')

  let groups = []
  progress('NSLookup (via DNS)', servers.dns.length)
  groups = groups.concat(
    await Promise.map(servers.dns, server => {
      return nslookup(domain, server)
        .tap(() => progress.success('NSLookup (via DNS)'))
        .then(
          ips => ({ protocol: 'dns', server, domain, ips }),
          error => {
            progress.warn('NSLookup (via DNS)', error.message)
            return {
              protocol: 'dns',
              server,
              domain,
              ips: [],
            }
          }
        )
    })
  )
  progress('NSLookup (via DoH)', servers.doh.length)
  groups = groups.concat(
    await Promise.map(servers.doh, server => {
      return nslookup(domain, server, 'DOH')
        .tap(() => progress.success('NSLookup (via DoH)'))
        .then(
          ips => ({
            protocol: 'doh',
            server,
            domain,
            ips,
          }),
          error => {
            progress.warn('NSLookup (via DoH)', error.message)
            return {
              protocol: 'doh',
              server,
              domain,
              ips: [],
            }
          }
        )
    })
  )
  verbose(`nslookup result: ${JSON.stringify(groups, null, 2)}`)

  const ips = unique(flatten(groups.map(({ ips }) => ips)))
  verbose(`ips after removal of repetition: ${JSON.stringify(ips, null, 2)}`)

  const providers = {}

  ips.forEach(ip => {
    providers[ip] = groups
      .filter(({ ips }) => ips.includes(ip))
      .map(({ protocol, server }) => (protocol === 'doh' ? `${server} (DoH)` : server))
  })

  if (isDomainURI) {
    progress('Ping', ips.length)
    const times = await Promise.map(ips, ip => {
      return ping(ip, pingTimeout)
        .tap(() => progress.success('Ping'))
        .then(
          duration => ({ ip, duration, providers: providers[ip] }),
          error => {
            progress.warn('Ping', error.message)
            return {
              ip,
              duration: Infinity,
              providers: providers[ip],
            }
          }
        )
    })
    verbose(`times: ${JSON.stringify(times, null, 2)}`)
    const sorted = times.sort((left, right) => left.duration - right.duration)
    return { times: sorted, isDomainURI }
  }
  progress('Fetch', ips.length)
  const times = await Promise.map(ips, ip => {
    return fetch(uri, ip, fetchTimeout)
      .tap(() => progress.success('Fetch'))
      .then(
        duration => ({ ip, duration, providers: providers[ip] }),
        error => {
          progress.warn('Fetch', error.message)
          return {
            ip,
            duration: Infinity,
            providers: providers[ip],
          }
        }
      )
  })
  verbose(`times: ${JSON.stringify(times, null, 2)}`)
  const sorted = times.sort((left, right) => left.duration - right.duration)
  return { times: sorted, isDomainURI }
}
