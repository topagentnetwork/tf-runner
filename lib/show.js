const spawn = require('child_process').spawn

const config = require('./config')
const contextFactory = require('./context')

exports.command = 'show'

exports.describe = 'Output terraform state'

exports.builder = argv => {
  return argv.env(config.envPrefix)
}

exports.handler = argv => {
  const context = contextFactory(argv)

  context.run(envDir => {
    const showCmd = spawn('terraform', ['show'], {cwd: envDir})

    showCmd.stdout.on('data', data => {
      console.log(data.toString())
    })

    showCmd.stderr.on('data', data => {
      console.log(data.toString())
    })
  })
}
