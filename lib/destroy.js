const execSync = require('child_process').execSync
const exec = require('child_process').exec

const ora = require('ora')
const inquirer = require('inquirer')

const config = require('./config')
const contextFactory = require('./context')

exports.command = 'destroy'

exports.describe = 'Run terraform destroy'

exports.builder = argv => {
  return argv.env(config.envPrefix)
}

exports.handler = argv => {
  const context = contextFactory(argv)

  const destroyInfrastructure = envDir => {
    const spinner = ora('Destroying your infrastructure')
    spinner.start()

    exec(`terraform destroy -force`, {cwd: envDir}, (err, stdout, stderr) => {
      console.log(stdout)
      console.log(stderr)

      if (err) {
        console.log(err)
      }

      spinner.stop()
    })
  }

  context.run((envDir, runDir, options) => {
    if(options.assumeYes) {
      destroyInfrastructure(envDir)
      return
    }

    execSync(`terraform plan -destroy`, {cwd: envDir, stdio: [0, 1, 2]})

    inquirer.prompt([{
      type: 'confirm',
      name: 'destroy',
      message: 'Do you want to apply this destruction plan?',
      when: !options.assumeYes
      }
    ])
    .then(answers => {
      if (answers.destroy) {
        destroyInfrastructure(envDir)
      }
    })
  })
}
