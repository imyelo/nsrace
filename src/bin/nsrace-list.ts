#!/usr/bin/env node

import { program } from 'commander'
import { config } from '../core/config.js'
import { print, OUTPUT_FORMATS, IOutputFormat } from '../core/print.js'

program
  .option(
    '-o, --output [format]',
    `Specify the format of the output [${OUTPUT_FORMATS.join('|')}]`,
    'table'
  )
  .parse(process.argv)

const options = program.opts<{
  output: IOutputFormat
}>()
const servers = config.get('servers')

if (options.output === 'table') {
  print(options.output, [['DNS', ...servers.dns]], [])
  print(options.output, [['DOH', ...servers.doh]], [])
} else {
  print(options.output, servers, [])
}
