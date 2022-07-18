#!/usr/bin/env node

import { program } from 'commander'
import chalk from 'chalk'
import { print, OUTPUT_FORMATS, IOutputFormat } from '../core/print.js'
import { run } from '../core/index.js'

const DEFAULT_PING_TIMEOUT = '1000'
const DEFAULT_FETCH_TIMEOUT = '1000'

;(async () => {
  try {
    program
      .option('-o, --output [format]', `Specify the format of the output [${OUTPUT_FORMATS.join('|')}]`, 'table')
      .option('--ping-timeout [ms]', 'Ping timeout', DEFAULT_PING_TIMEOUT)
      .option('--fetch-timeout [ms]', 'Fetch timeout', DEFAULT_FETCH_TIMEOUT)
      .option('-s, --silent', 'Hide the progress')
      .option('-v, --verbose', 'Display verbose information')
      .parse(process.argv)

    const options = program.opts<{
      output: IOutputFormat
      pingTimeout: string
      fetchTimeout: string
      silent: boolean
      verbose: boolean
    }>()

    const verbose = message => {
      if (!options.verbose) {
        return
      }
      console.info(chalk.blue('nsrace > ') + message)
    }

    const progress = options.silent ? ((() => {}) as any) : (await import('../core/progress.js')).progress

    const { times, isDomainURI } = await run({
      uri: program.args[0],
      pingTimeout: +options.pingTimeout,
      fetchTimeout: +options.fetchTimeout,
      progress,
      verbose,
    })

    const prettyTimes = times.map(({ ip, duration, providers }) => ({
      ip,
      duration: duration.toFixed(0),
      providers: providers?.map(({ server, protocol }) => (protocol === 'DoH' ? `${server} (DoH)` : server)),
    }))

    if (isDomainURI) {
      print(options.output, prettyTimes, ['IP', 'Ping (ms)', 'Providers'])
    } else {
      print(options.output, prettyTimes, ['IP', 'Duration (ms)', 'Providers'])
    }
  } catch (error) {
    console.log(error)
  }
})()
