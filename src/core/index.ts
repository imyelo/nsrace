import { URL } from 'node:url'
import unique from 'just-unique'
import flatten from 'just-flatten-it'
import pAll from 'p-all'
import { config } from './config.js'
import nslookup from './nslookup/index.js'
import { fetch } from './speed/fetch.js'
import { ping } from './speed/ping.js'
import { checkIsDomainURI } from './utils.js'
import { IProtocol, IProgress, IVerbose, ITimeRecord, IRaceOption, IRaceResult } from './interface.js'

export * from './interface.js'

interface ILookupRecord {
  protocol: IProtocol
  server: string
  domain: string
  ips: string[]
}
interface IServer {
  server: string
  protocol: IProtocol
}

const defaultProgress: IProgress = (() => {
  const progress = () => {}
  progress.success = () => {}
  progress.warn = () => {}
  progress.fail = () => {}
  return progress
})()
const defaultVerbose: IVerbose = () => {}

export const race = async ({
  uri,
  pingTimeout,
  fetchTimeout,
  progress = defaultProgress,
  verbose = defaultVerbose,
}: IRaceOption): Promise<IRaceResult> => {
  const isDomainURI = checkIsDomainURI(uri)
  const domain = isDomainURI ? uri : new URL(uri).hostname

  const serversGroups = config.get('servers')
  const servers = [
    ...serversGroups.dns.map<IServer>(server => ({ server, protocol: 'DNS' })),
    ...serversGroups.doh.map<IServer>(server => ({ server, protocol: 'DoH' })),
  ]

  const groups: ILookupRecord[] = []

  progress('NSLookup', servers.length)
  groups.push(
    ...(await pAll(
      servers.map(({ server, protocol }) => async () => {
        try {
          const ips = await nslookup(domain, server)
          progress.success('NSLookup')
          return { protocol, server, domain, ips }
        } catch (error) {
          progress.warn('NSLookup', error.message)
          return {
            protocol,
            server,
            domain,
            ips: [],
          }
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
      ips.map<() => Promise<ITimeRecord>>(ip => async () => {
        try {
          const duration = await ping(ip, pingTimeout)
          progress.success('Ping')
          return { ip, duration, providers: providers[ip] }
        } catch (error) {
          progress.warn('Ping', error.message)
          return {
            ip,
            duration: Infinity,
            providers: providers[ip],
          }
        }
      })
    )
    verbose(`times: ${JSON.stringify(times, null, 2)}`)
    const sorted = times.sort((left, right) => left.duration - right.duration)
    return { times: sorted, isDomainURI }
  }

  progress('Fetch', ips.length)
  const times: ITimeRecord[] = await pAll(
    ips.map<() => Promise<ITimeRecord>>(ip => async () => {
      try {
        const duration = await fetch(uri, ip, fetchTimeout)
        progress.success('Fetch')
        return { ip, duration, providers: providers[ip] }
      } catch (error) {
        progress.warn('Fetch', error.message)
        return {
          ip,
          duration: Infinity,
          providers: providers[ip],
        }
      }
    })
  )
  verbose(`times: ${JSON.stringify(times, null, 2)}`)
  const sorted = times.sort((left, right) => left.duration - right.duration)
  return { times: sorted, isDomainURI }
}
