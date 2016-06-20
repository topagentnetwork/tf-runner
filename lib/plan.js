const spawn = require('child_process').spawn

const chalk = require('chalk')

const config = require('./config')
const contextFactory = require('./context')

exports.command = 'plan'

exports.describe = 'Generate a terraform plan'

exports.builder = argv => {
  return argv.env(config.envPrefix).option('D', {
    alias: 'destroy',
    description: 'Generate plan to destroy all resources',
    group: 'Command Options'
  })
}

exports.handler = argv => {
  const context = contextFactory(argv)

  context.run(envDir => {
    const rest = argv._.slice(1)
    const options = argv.destroy ? ['plan', '-detailed-exitcode', '-destroy'] : ['plan', '-detailed-exitcode']
    const finalOptions = options.concat(rest)

    const planCmd = spawn('terraform', finalOptions, {cwd: envDir, stdio: ['inherit', 'pipe', 'pipe']})

    planCmd.stdout.on('data', data => {
      console.log(data.toString())
    })

    planCmd.stderr.on('data', data => {
      console.log(data.toString())
    })

    planCmd.on('close', code => {
      if (code === 1) {
        console.log(chalk.red('Error running plan, please review'))
      } else if (code === 2) {
        console.log(chalk.magenta('A diff exist. Run apply to apply it.'))
      }
    })
  })
}
