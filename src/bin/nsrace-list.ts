#!/usr/bin/env node

import { program } from 'commander'
import { config } from '../core/config.js'
import { print, OUTPUT } from '../core/print.js'

program
  .option(
    '-o, --output [format]',
    `Specify the format of the output [${Object.values(OUTPUT).join('|')}]`,
    OUTPUT.TABLE
  )
  .parse(process.argv)

const options = program.opts<{
  output: typeof OUTPUT[keyof typeof OUTPUT]
}>()
const servers = config.get('servers')

if (options.output === OUTPUT.TABLE) {
  print(options.output, [['DNS', ...servers.dns]], [])
  print(options.output, [['DOH', ...servers.doh]], [])
} else {
  print(options.output, servers, [])
}
