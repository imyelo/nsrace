import tcpp from 'tcp-ping'

export const ping = (address: string, timeout: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    tcpp.ping({ address, timeout }, (error, data) => {
      if (error) {
        reject(error)
        return
      }
      resolve(Number.isNaN(data.avg) ? Infinity : data.avg)
    })
  })
}
