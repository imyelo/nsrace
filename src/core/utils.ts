import { isIP } from 'node:net'

export const checkIsServerString = server => {
  const matched = server.match(/^([^:]*)(?::(\d*))?$/)
  if (!matched) {
    return false
  }
  const [, ip] = matched
  if (!isIP(ip)) {
    return false
  }
  return true
}

export const checkIsDomainURI = url => {
  return !url.includes('/')
}
