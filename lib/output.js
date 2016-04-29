const spawn = require('child_process').spawn

const config = require('./config')
const contextFactory = require('./context')

exports.command = 'output [module]'

exports.describe = 'Read and print terraform outputs from state files'

exports.builder = argv => {
  return argv.env(config.envPrefix)
}

exports.handler = argv => {
  const context = contextFactory(argv)

  context.run(envDir => {
    const cmdArgs = ['output']
    if (argv.module) {
      cmdArgs.push(`-module=${argv.module}`)
    }

    const outputCmd = spawn('terraform', cmdArgs, {cwd: {envDir}})

    outputCmd.stdout.on('data', data => {
      console.log(data.toString())
    })

    outputCmd.stderr.on('data', data => {
      console.log(data.toString())
    })
  })
}
