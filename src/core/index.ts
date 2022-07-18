import Bluebird from 'bluebird'
import { URL } from 'node:url'
import unique from 'just-unique'
import flatten from 'just-flatten-it'
import { config } from './config.js'
import nslookup from './nslookup/index.js'
import { fetch } from './speed/fetch.js'
import { ping } from './speed/ping.js'
import { checkIsDomainURI } from './utils.js'
import { IProtocol, IProgress, IVerbose, ITimeRecord, IRunOption, IRunResult } from './interface.js'

export * from './interface.js'

interface ILookupRecord {
  protocol: IProtocol
  server: string
  domain: string
  ips: string[]
}

const defaultProgress: IProgress = (() => {
  const progress = () => {}
  progress.success = () => {}
  progress.warn = () => {}
  progress.fail = () => {}
  return progress
})()
const defaultVerbose: IVerbose = () => {}

export const run = async ({
  uri,
  pingTimeout,
  fetchTimeout,
  progress = defaultProgress,
  verbose = defaultVerbose,
}: IRunOption): Promise<IRunResult> => {
  const isDomainURI = checkIsDomainURI(uri)
  const domain = isDomainURI ? uri : new URL(uri).hostname

  const servers = config.get('servers')

  const groups: ILookupRecord[] = []

  progress('DNS Lookup', servers.dns.length)
  groups.push(
    ...(await Bluebird.map(servers.dns, server => {
      return nslookup(domain, server)
        .tap(() => progress.success('DNS Lookup'))
        .then(
          ips => ({ protocol: 'DNS', server, domain, ips } as ILookupRecord),
          error => {
            progress.warn('DNS Lookup', error.message)
            return {
              protocol: 'DNS',
              server,
              domain,
              ips: [],
            } as ILookupRecord
          }
        )
    }))
  )
  progress('DoH Lookup', servers.doh.length)
  groups.push(
    ...(await Bluebird.map(servers.doh, server => {
      return nslookup(domain, server, 'DOH')
        .tap(() => progress.success('DoH Lookup'))
        .then(
          ips =>
            ({
              protocol: 'DoH',
              server,
              domain,
              ips,
            } as ILookupRecord),
          error => {
            progress.warn('DoH Lookup', error.message)
            return {
              protocol: 'DoH',
              server,
              domain,
              ips: [],
            } as ILookupRecord
          }
        )
    }))
  )
  verbose(`nslookup result: ${JSON.stringify(groups, null, 2)}`)

  const ips: string[] = unique(flatten(groups.map(({ ips }) => ips)))
  verbose(`ips after removal of repetition: ${JSON.stringify(ips, null, 2)}`)

  const providers: Record<string, ITimeRecord['providers']> = {}
  ips.forEach(ip => {
    providers[ip] = groups.filter(({ ips }) => ips.includes(ip)).map(({ protocol, server }) => ({ protocol, server }))
  })

  if (isDomainURI) {
    progress('Ping', ips.length)
    const times: ITimeRecord[] = await Bluebird.map(ips, ip => {
      return ping(ip, pingTimeout)
        .tap(() => progress.success('Ping'))
        .then(
          duration => ({ ip, duration, providers: providers[ip] } as ITimeRecord),
          error => {
            progress.warn('Ping', error.message)
            return {
              ip,
              duration: Infinity,
              providers: providers[ip],
            } as ITimeRecord
          }
        )
    })
    verbose(`times: ${JSON.stringify(times, null, 2)}`)
    const sorted = times.sort((left, right) => left.duration - right.duration)
    return { times: sorted, isDomainURI }
  }

  progress('Fetch', ips.length)
  const times: ITimeRecord[] = await Bluebird.map(ips, ip => {
    return fetch(uri, ip, fetchTimeout)
      .tap(() => progress.success('Fetch'))
      .then(
        duration => ({ ip, duration, providers: providers[ip] } as ITimeRecord),
        error => {
          progress.warn('Fetch', error.message)
          return {
            ip,
            duration: Infinity,
            providers: providers[ip],
          } as ITimeRecord
        }
      )
  })
  verbose(`times: ${JSON.stringify(times, null, 2)}`)
  const sorted = times.sort((left, right) => left.duration - right.duration)
  return { times: sorted, isDomainURI }
}
