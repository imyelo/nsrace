import { isIP } from 'node:net'

export const checkIsServerString = (server: string) => {
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

export const checkIsDomainURI = (url: string) => {
  return !url.includes('/')
}
