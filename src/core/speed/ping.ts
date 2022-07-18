import Bluebird from 'bluebird'
import tcpp from 'tcp-ping'

export const ping = (address: string, timeout: number): Bluebird<number> => {
  return new Bluebird((resolve, reject) => {
    tcpp.ping({ address, timeout }, (error, data) => {
      if (error) {
        reject(error)
        return
      }
      resolve(Number.isNaN(data.avg) ? Infinity : data.avg)
    })
  })
}
