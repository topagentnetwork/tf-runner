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
  return argv.env(config.envPrefix).option('var', {
    description: 'Set a variable in the Terraform configuration. This flag can be used multiple times',
    group: 'Command Options'
  })
}

exports.handler = argv => {
  const context = contextFactory(argv)
  let varOptions

  if(argv.var) {
    if(Array.isArray(argv.var)) {
      varOptions = argv.var.reduce( (memo, curr) => {
        const newVar = ['-var', curr]
        return memo.concat(newVar)
      }, [])
    } else {
      varOptions = ['-var', argv.var]
    }
  }

  const validateRestParams = () => {
    const rest = argv._.slice(1)

    if(rest.length > 0) {
      if(rest.indexOf('-var') >= 0) {
        console.error(chalk.red('Cannot pass through var options to apply command. Use the built-in --var option.'))
        process.exit(1)
      }
    }
  }

  const applyCmdOptions = (tempPlan) => {
    const rest = argv._.slice(1)
    let options = ['apply']

    if(rest.length > 0) {
      options = options.concat(rest)
    }

    if(varOptions) {
      options = options.concat(varOptions)
    }

    return options.concat(tempPlan)
  }
                                                
  const applyPlan = (envDir, tempPlan) => {
    const spinner = ora('Applying the plan')
    spinner.stream = process.stdout
    spinner.start()

    const applyCmd = spawn('terraform', applyCmdOptions(tempPlan), {cwd: envDir})

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

  context.run((envDir, runDir, options) => {
    validateRestParams()

    const tempPlan = path.resolve(runDir, 'tf.plan')
    const vOpts = varOptions ? varOptions.join(' ') : ''
    execSync(`terraform plan ${vOpts} -out=${tempPlan}`, {cwd: envDir, stdio: [0, 1, 2]})

    if(options.assumeYes) {
      applyPlan(envDir, tempPlan)
      return
    }

    inquirer.prompt([{
      type: 'confirm',
      name: 'apply',
      message: 'Do you want to apply this plan?',
      when: !options.assumeYes
    }]).then(answers => {
      if (answers.apply) {
        applyPlan(envDir, tempPlan)
      }
    })
  })
}
