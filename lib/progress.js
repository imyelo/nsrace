const ora = require('ora')

let spinner = ora()
let tasks = {}

function update (name) {
  spinner.text = `${name} ${tasks[name].current}/${tasks[name].amount}`
}

module.exports = function progress (name, amount) {
  if (arguments.length === 2) {
    tasks[name] = {
      amount,
      current: 0,
    }
    update(name)
    return spinner.start()
  }
  tasks[name].current += 1
  update(name)

  if (tasks[name].current >= tasks[name].amount) {
    spinner.succeed()
  }
}
