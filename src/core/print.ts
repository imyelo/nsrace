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

export function print(format: 'json', list: unknown[]): void
export function print(format: 'table' | 'tsv', list: unknown[], titles: string[]): void
export function print(format: IOutputFormat, list: unknown[], titles?: string[]): void {
  if (format === 'json') {
    return log(JSON.stringify(list))
  }

  const sheet: {}[][] =
    typeof list[0] === 'object'
      ? list.map(item => Object.values(item).map(pretty))
      : list.map(item => [item].map(pretty))

  if (format === 'table') {
    const table = new Table({
      head: titles,
    })
    table.push(...sheet)

    return log(table.toString())
  }

  if (format === 'tsv') {
    return log(tsv(sheet))
  }

  throw new Error('Unknown print format.')
}
