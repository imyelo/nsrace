#!/usr/bin/env node

import { program } from 'commander'

program
  .command('run [domain]', 'Run a race and return IPs sorted by speed')
  .command('list', 'List all DNS servers that will be used in the race')
  .command('add [dns]', 'Add DNS servers')
  .command('remove [dns]', 'Remove DNS servers')
  .command('reset', 'Reset DNS servers')
  .parse(process.argv)
