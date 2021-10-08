const Promise = require("bluebird")
const got = require("got")
const now = require("performance-now")

// forked from https://github.com/Moonvy/Figma-Net-OK/blob/8bda153/app/script/testUrl.js

const createStaticLookup = (ip, version) => (hostname, options, callback) =>
  callback(null, ip, version || 4)

module.exports = function fetch(url, ns, timeout = 10 * 1000) {
  return new Promise((resolve) => {
    const startAt = now()
    got(url, {
      lookup: createStaticLookup(ns),
      timeout,
    }).then(() => {
      resolve(now() - startAt)
    })
  })
}
