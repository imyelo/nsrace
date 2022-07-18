import { URL } from 'node:url'
import unique from 'just-unique'
import flatten from 'just-flatten-it'
import pAll from 'p-all'
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
    ...(await pAll(
      servers.dns.map(server => async () => {
        try {
          const ips = await nslookup(domain, server)
          progress.success('DNS Lookup')
          return { protocol: 'DNS', server, domain, ips } as ILookupRecord
        } catch (error) {
          progress.warn('DNS Lookup', error.message)
          return {
            protocol: 'DNS',
            server,
            domain,
            ips: [],
          } as ILookupRecord
        }
      })
    ))
  )

  progress('DoH Lookup', servers.doh.length)
  groups.push(
    ...(await pAll(
      servers.doh.map(server => async () => {
        try {
          const ips = await nslookup(domain, server)
          progress.success('DoH Lookup')
          return { protocol: 'DoH', server, domain, ips } as ILookupRecord
        } catch (error) {
          progress.warn('DoH Lookup', error.message)
          return {
            protocol: 'DoH',
            server,
            domain,
            ips: [],
          } as ILookupRecord
        }
      })
    ))
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
    const times: ITimeRecord[] = await pAll(
      ips.map(ip => async () => {
        try {
          const duration = await ping(ip, pingTimeout)
          progress.success('Ping')
          return { ip, duration, providers: providers[ip] } as ITimeRecord
        } catch (error) {
          progress.warn('Ping', error.message)
          return {
            ip,
            duration: Infinity,
            providers: providers[ip],
          } as ITimeRecord
        }
      })
    )
    verbose(`times: ${JSON.stringify(times, null, 2)}`)
    const sorted = times.sort((left, right) => left.duration - right.duration)
    return { times: sorted, isDomainURI }
  }

  progress('Fetch', ips.length)
  const times: ITimeRecord[] = await pAll(
    ips.map(ip => async () => {
      try {
        const duration = await fetch(uri, ip, fetchTimeout)
        progress.success('Fetch')
        return { ip, duration, providers: providers[ip] } as ITimeRecord
      } catch (error) {
        progress.warn('Fetch', error.message)
        return {
          ip,
          duration: Infinity,
          providers: providers[ip],
        } as ITimeRecord
      }
    })
  )
  verbose(`times: ${JSON.stringify(times, null, 2)}`)
  const sorted = times.sort((left, right) => left.duration - right.duration)
  return { times: sorted, isDomainURI }
}
