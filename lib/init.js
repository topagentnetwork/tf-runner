const spawn = require('child_process').spawn

const chalk = require('chalk')

const config = require('./config')
const contextFactory = require('./context')

exports.command = 'init'

exports.describe = 'Run terraform init'

exports.builder = argv => {
  return argv.env(config.envPrefix).option('C', {
    alias: 'copy-state',
    description: 'Copy state data when initializing',
    group: 'Command Options',
  })
}

exports.handler = argv => {
  const context = contextFactory(argv)

  context.run(envDir => {
    const rest = argv._.slice(1)
    const options = argv.copyState ? ['init', '-force-copy'] : ['init']
    const finalOptions = options.concat(rest)

    const planCmd = spawn('terraform', finalOptions, { cwd: envDir, stdio: ['inherit', 'pipe', 'pipe'] })

    planCmd.stdout.on('data', data => {
      console.log(data.toString())
    })

    planCmd.stderr.on('data', data => {
      console.log(data.toString())
    })

    planCmd.on('close', code => {
      if (code === 1) {
        console.log(chalk.red('Error running init, please review'))
      }
    })
  })
}
