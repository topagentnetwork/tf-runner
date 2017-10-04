const spawn = require('child_process').spawn

const chalk = require('chalk')

const config = require('./config')
const contextFactory = require('./context')

exports.command = 'output [name]'

exports.describe = 'Read and print terraform outputs from state files'

exports.builder = argv => {
  return argv.env(config.envPrefix).option('module', {
    type: 'string',
    requiresArgs: true,
  })
}

exports.handler = argv => {
  const context = contextFactory(argv)

  context.run(envDir => {
    const cmdArgs = ['output']

    if (argv.module) {
      cmdArgs.push(`-module=${argv.module}`)
    }

    if (argv.name) {
      cmdArgs.push(argv.name)
    }

    const outputCmd = spawn('terraform', cmdArgs, { cwd: envDir })

    outputCmd.stdout.on('data', data => {
      console.log(chalk.cyan(data))
    })

    outputCmd.stderr.on('data', data => {
      console.log(data.toString())
    })
  })
}
