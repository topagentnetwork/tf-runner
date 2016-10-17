const inquirer = require('inquirer')
const rimraf = require('rimraf')

const config = require('./config')
const contextFactory = require('./context')

exports.command = 'clean'

exports.describe = 'Delete cached terraform state'

exports.builder = argv => argv.env(config.envPrefix)

exports.handler = argv => {
  const context = contextFactory(argv)
  const tfDir = context.terraformDir()

  inquirer.prompt([{
    type: 'confirm',
    name: 'clean',
    message: `Are you sure you want to delete ${tfDir}?`
  }])
  .then(answers => {
    if (answers.clean) {
      rimraf.sync(tfDir)
    }
  })
}
