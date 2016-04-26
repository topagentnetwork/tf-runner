const fs = require('fs')
const execSync = require('child_process').execSync
const spawn = require('child_process').spawn
const path = require('path')

const ora = require('ora')
const inquirer = require('inquirer')
const chalk = require('chalk')

const config = require('./config')
const contextFactory = require('./context')

exports.command = 'apply'

exports.describe = 'Run terraform apply'

exports.builder = argv => {
  return argv.env(config.envPrefix)
}

exports.handler = argv => {
  const context = contextFactory(argv)

  context.run((envDir, runDir) => {
    const tempPlan = path.resolve(runDir, 'tf.plan')
    execSync(`terraform plan -out=${tempPlan}`, {cwd: envDir, stdio: [0, 1, 2]})

    inquirer.prompt([{
      type: 'confirm',
      name: 'apply',
      message: 'Do you want to apply this plan?'
    }]).then(answers => {
      if (answers.apply) {
        const spinner = ora('Applying the plan')
        spinner.stream = process.stdout
        spinner.start()

        const applyCmd = spawn('terraform', ['apply', tempPlan], {cwd: envDir})

        applyCmd.stdout.on('data', data => {
          console.log(data.toString())
          spinner.clear()
        })

        applyCmd.stderr.on('data', data => {
          console.log(data.toString())
          spinner.clear()
        })

        applyCmd.on('close', code => {
          if (code !== 0) {
            console.log(chalk.red(`terraform apply had a non-zero exit code (${code}), please review`))
          }
          fs.unlink(tempPlan)
          spinner.stop()
        })
      }
    })
  })
}
