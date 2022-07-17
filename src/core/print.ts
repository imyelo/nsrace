import Table from 'cli-table'
import tsv from 'text-table'

export const OUTPUT = {
  TABLE: 'table',
  TSV: 'tsv',
  JSON: 'json',
} as const

const { log } = console

function pretty(obj) {
  if (Array.isArray(obj)) {
    return obj.join('|')
  }
  return obj
}

export function print(format, list, titles) {
  let payload = list
  if ([OUTPUT.TABLE, OUTPUT.TSV].includes(format)) {
    if (typeof list[0] === 'object') {
      payload = list.map(item => Object.values(item).map(pretty))
    } else {
      payload = list.map(item => [item].map(pretty))
    }
  }

  if (format === OUTPUT.TABLE) {
    const table = new Table({
      head: titles,
    })
    table.push(...payload)

    return log(table.toString())
  }

  if (format === OUTPUT.TSV) {
    return log(tsv(payload))
  }

  if (format === OUTPUT.JSON) {
    return log(JSON.stringify(payload))
  }

  throw new Error('Unknown print format.')
}
