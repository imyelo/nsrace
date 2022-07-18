import Bluebird from 'bluebird'
import got from 'got'
import now from 'performance-now'

// forked from https://github.com/Moonvy/Figma-Net-OK/blob/8bda153/app/script/testUrl.js

type IGotDNSLookup = (
  hostname: string,
  options: unknown,
  callback: (error: Error | void, ip: string, version: number) => void
) => void

const createStaticLookup =
  (ip: string, version?: number): IGotDNSLookup =>
  (hostname, options, callback) =>
    callback(null, ip, version || 4)

export const fetch = (url: string, ns: string, timeout: number = 10 * 1000): Bluebird<number> => {
  return new Bluebird((resolve, reject) => {
    const startAt = now()
    got(url, {
      dnsLookup: createStaticLookup(ns),
      dnsCache: false,
      timeout: {
        request: timeout,
      },
    }).then(
      () => {
        resolve(now() - startAt)
      },
      error => reject(error)
    )
  })
}
