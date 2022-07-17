import Promise from 'bluebird'
import got from 'got'
import now from 'performance-now'

// forked from https://github.com/Moonvy/Figma-Net-OK/blob/8bda153/app/script/testUrl.js

const createStaticLookup = (ip, version?) => (hostname, options, callback) => callback(null, ip, version || 4)

export const fetch = (url, ns, timeout = 10 * 1000) => {
  return new Promise((resolve, reject) => {
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
