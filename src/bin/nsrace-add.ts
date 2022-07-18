#!/usr/bin/env node

import { program } from 'commander'
import assert from 'assert'
import remove from 'just-remove'
import { config } from '../core/config.js'
import { checkIsServerString } from '../core/utils.js'
import type { ICLIProtocolType } from '../core/interface.js'

const DEFAULT_TYPE: ICLIProtocolType = 'dns'

program.option('-t, --type [dns|doh]', `Server type`, DEFAULT_TYPE).parse(process.argv)

const options = program.opts<{
  type: ICLIProtocolType
}>()

assert(['dns', 'doh'].includes(options.type), 'Invalid type')

const key = `servers.${options.type}`
const latest: string[] = config.get(key) || []
const patch = remove(program.args, latest).filter(server => checkIsServerString(server))
config.set(key, latest.concat(patch))

console.log(`${patch.length} ${options.type.toUpperCase()} servers added.`)
