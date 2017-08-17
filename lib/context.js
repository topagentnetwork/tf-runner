const execSync = require('child_process').execSync
const path = require('path')

const chalk = require('chalk')
const ora = require('ora')

const existsSync = require('./fs-util').existsSync

const Context = function(argv) {
  this.argv = argv
  this.env = argv.env
  this.project = argv.project
  this.bucket = argv.s3Bucket
  this.region = argv.awsRegion
  this.root = argv.root
  this.updateModules = argv.updateModules
  this.assumeYes = argv.assumeYes
  this.verbose = argv.verbose
  this.command = argv._.length > 0 ? argv._[0] : null
}

Context.prototype.envDir = function() {
  return path.resolve(this.root, 'environments', this.env)
}

Context.prototype.runDir = function() {
  return path.resolve(this.root, 'tmp')
}

Context.prototype.terraformDir = function() {
  return path.resolve(this.envDir(this.env), '.terraform')
}

Context.prototype.tfLocalCache = function() {
  return path.resolve(this.envDir(this.env), '.terraform/terraform.tfstate')
}

Context.prototype.shouldFetchModules = function() {
  return this.command !== 'output'
}

Context.prototype.initTerraform = function(envDir) {
  const spinner = ora('Initializing terraform')
  spinner.start()

  const terraformCmd = `terraform init`

  execSync(terraformCmd, { cwd: envDir, stdio: [0, 1, 2] })

  spinner.text = 'Done Initializing'
  spinner.stop()
}

Context.prototype.fetchModules = function(envDir) {
  this.info(chalk.cyan('Getting and installing terraform modules'))

  const updateModules = this.updateModules
  const getCmd = `terraform get -update=${updateModules}`

  const cmdStdIo = this.verbose ? [0, 1, 2] : [process.stdin, 'ignore', process.stderr]
  execSync(getCmd, { cwd: envDir, stdio: cmdStdIo })
}

Context.prototype.run = function(callback) {
  const envDir = this.envDir()
  const runDir = this.runDir()
  const tfLocalCache = this.tfLocalCache()

  if (existsSync(envDir)) {
    process.chdir(envDir)
    this.info(chalk.blue('Running', chalk.bold.underline(this.project), `in ${envDir}`))

    if (!existsSync(tfLocalCache) && this.argv._[0] !== 'init') {
      this.error(chalk.yello('Terraform is ont initialized... Running Terraform init'))
      this.initTerraform(envDir)
    }

    if (this.shouldFetchModules()) {
      this.fetchModules(envDir)
    }

    callback(envDir, runDir, { assumeYes: this.assumeYes })
  } else {
    this.error(chalk.red(`Can't find environment ${this.env} directory: ${envDir}`))
  }
}

Context.prototype.info = function(message) {
  if (this.verbose) {
    console.log(message)
  }
}

Context.prototype.error = function(message) {
  console.error(message)
}

module.exports = function(argv) {
  return new Context(argv)
}
