const Table = require('cli-table')

const OUTPUT = {
  TABLE: 'table',
  JSON: 'json',
}

const log = console.log

function pretty (obj) {
  if (Array.isArray(obj)) {
    return obj.join('\n')
  }
  return obj
}

function print (format, list, titles) {
  if (format === OUTPUT.TABLE) {
    if (typeof list[0] === 'object') {
      list = list.map((item) => Object.values(item).map(pretty))
    } else {
      list = list.map((item) => [item].map(pretty))
    }

    let table = new Table({
      head: titles,
    })
    table.push.apply(table, list)

    return log(table.toString())
  }

  if (format === OUTPUT.JSON) {
    return log(JSON.stringify(list))
  }

  throw new Error('Unknown print format.')
}

module.exports = print
module.exports.OUTPUT = OUTPUT
