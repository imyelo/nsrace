#!/usr/bin/env node

import { program } from 'commander'
import assert from 'assert'
import remove from 'just-remove'
import { config } from '../core/config.js'

const DEFAULT_TYPE = 'dns'

program.option('-t, --type [dns|doh]', `Server type`, DEFAULT_TYPE).parse(process.argv)

const options = program.opts<{
  type: 'dns' | 'doh'
}>()

assert(['dns', 'doh'].includes(options.type), 'Invalid type')

const key = `servers.${options.type}`
const latest: string[] = config.get(key) || []
const next = remove(latest, program.args)
config.set(key, next)

console.log(`${latest.length - next.length} DNS servers removed.`)
