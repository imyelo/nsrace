declare module 'dns2' {
  type Lookup = (domain: string) => Promise<{
    answers: {
      type: string
      address: string
    }[]
  }>

  interface DNS2 {
    UDPClient: (options: { dns: string; port: number }) => Lookup
    DOHClient: (options: { dns: string }) => Lookup
    Packet: {
      TYPE: {
        A: string
        AAAA: string
      }
    }
  }

  export default {} as DNS2
}
