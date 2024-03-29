import ora from 'ora'
import chalk from 'chalk'
import { IProgress } from './interface.js'

const spinner = ora()
const tasks: Record<string, {
  success: number,
  warn: number,
  fail: number,
  expected: number,
}> = {}

const update = (name: string, message?: string) => {
  const { success, warn, fail, expected } = tasks[name]
  spinner.text = `${name} ${success + warn}/${expected}. ${warn ? chalk.yellow(`(${warn} warns)`) : ''} ${
    fail ? chalk.yellow(`(${fail} fails)`) : ''
  }`

  if (message) {
    process.stderr.write(`\n${message}`)
  }

  if (fail) {
    spinner.fail()
    return
  }
  if (success + warn >= expected) {
    spinner.succeed()
  }
}

export const progress: IProgress = (name, expected) => {
  tasks[name] = {
    expected,
    success: 0,
    warn: 0,
    fail: 0,
  }
  update(name)
  return spinner.start()
}
progress.success = (name, message) => {
  tasks[name].success += 1
  update(name, message)
}

progress.warn = (name, message) => {
  tasks[name].warn += 1
  update(name, message)
}

progress.fail = (name, message) => {
  tasks[name].fail += 1
  update(name, message)
}
