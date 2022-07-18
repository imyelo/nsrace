#!/usr/bin/env node

import { program } from 'commander'
import { config } from '../core/config.js'
import { print, OUTPUT_FORMATS, IOutputFormat } from '../core/print.js'

program
  .option('-o, --output [format]', `Specify the format of the output [${OUTPUT_FORMATS.join('|')}]`, 'table')
  .parse(process.argv)

const options = program.opts<{
  output: IOutputFormat
}>()
const servers = config.get('servers')
const payload = [
  { protocol: 'DNS', servers: servers.dns },
  { protocol: 'DoH', servers: servers.doh },
]

if (options.output === 'json') {
  print(options.output, payload)
} else {
  print(options.output, payload, ['Protocol', 'Servers'])
}
