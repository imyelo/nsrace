import Table from 'cli-table'
import tsv from 'text-table'

export const OUTPUT_FORMATS = ['table', 'tsv', 'json'] as const
export type IOutputFormat = typeof OUTPUT_FORMATS[number]

const { log } = console

function pretty(obj: unknown) {
  if (Array.isArray(obj)) {
    return obj.join('|')
  }
  return obj
}

export function print(format: IOutputFormat, list: unknown, titles: string[]) {
  let payload = list
  if (format === 'tsv' || format === 'table') {
    if (typeof list[0] === 'object') {
      payload = (list as unknown[]).map(item => Object.values(item).map(pretty))
    } else {
      payload = (list as unknown[]).map(item => [item].map(pretty))
    }
  }

  if (format === 'table') {
    const table = new Table({
      head: titles,
    })
    table.push(...payload as any)

    return log(table.toString())
  }

  if (format === 'tsv') {
    return log(tsv(payload as any))
  }

  if (format === 'json') {
    return log(JSON.stringify(payload))
  }

  throw new Error('Unknown print format.')
}
