const ora = require('ora')
const chalk = require('chalk')

let spinner = ora()
let tasks = {}

function update (name, message) {
  let { success, warn, fail, expected } = tasks[name]
  spinner.text = `${name} ${success + warn}/${expected}. ${warn ? chalk.yellow(`(${warn} warns)`) : ''} ${fail ? chalk.yellow(`(${fail} fails)`) : ''}`

  if (message) {
    process.stderr.write('\n' + message)
  }

  if (fail) {
    return spinner.fail()
  }
  if ((success + warn) >= expected) {
    spinner.succeed()
  }
}

module.exports = function progress (name, expected) {
  tasks[name] = {
    expected,
    success: 0,
    warn: 0,
    fail: 0,
  }
  update(name)
  return spinner.start()
}

module.exports.success = function success (name, message) {
  tasks[name].success += 1
  update(name, message)
}

module.exports.warn = function warn (name, message) {
  tasks[name].warn += 1
  update(name, message)
}

module.exports.fail = function fail (name, message) {
  tasks[name].fail += 1
  update(name, message)
}
