const spawn = require('child_process').spawn

const config = require('./config')
const contextFactory = require('./context')

exports.command = 'validate'

exports.describe = 'Validates the terraform files'

exports.builder = argv => {
  return argv.env(config.envPrefix)
}

exports.handler = argv => {
  const context = contextFactory(argv)

  context.run(envDir => {
    const validateCmd = spawn('terraform', ['validate'], {cwd: {envDir}})

    validateCmd.stdout.on('data', data => {
      console.log(data.toString())
    })

    validateCmd.stderr.on('data', data => {
      console.log(data.toString())
    })
  })
}
