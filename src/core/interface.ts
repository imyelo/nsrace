export type ICLIProtocolType = 'dns' | 'doh'

export interface IProgress {
  (name: string, size: number): void
  success: (name: string, message?: string) => void
  warn: (name: string, message?: string) => void
  fail: (name: string, message?: string) => void
}
export type IVerbose = (...messages: unknown[]) => void

export type IProtocol = 'DNS' | 'DoH'

export interface ITimeRecord {
  ip: string
  duration: number
  providers: {
    server: string
    protocol: IProtocol
  }[]
}

export interface IRaceOption {
  uri: string
  pingTimeout: number
  fetchTimeout: number
  progress?: IProgress
  verbose?: IVerbose
}
export interface IRaceResult {
  times: ITimeRecord[]
  isDomainURI: boolean
}
