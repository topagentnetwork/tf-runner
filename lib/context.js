const execSync = require('child_process').execSync
const path = require('path')

const chalk = require('chalk')
const ora = require('ora')

const existsSync = require('./fsUtil').existsSync

const Context = function (argv) {
  this.env = argv.env
  this.project = argv.project
  this.bucket = argv.s3Bucket
  this.region = argv.awsRegion
  this.root = argv.root
  this.updateModules = argv.updateModules
  this.assumeYes = argv.assumeYes
}

Context.prototype.envDir = function () {
  return path.resolve(this.root, 'environments', this.env)
}

Context.prototype.runDir = function () {
  return path.resolve(this.root, 'tmp')
}

Context.prototype.tfLocalCache = function () {
  return path.resolve(this.envDir(this.env), '.terraform/terraform.tfstate')
}

Context.prototype.configTerraformRemote = function (envDir) {
  const spinner = ora('Loading remote state')
  spinner.start()

  const terraformCmd = `terraform remote config --backend=s3 \
                        -backend-config="bucket=${this.bucket}" \
                        -backend-config="key=${this.project}/terraform-${this.env}.tfstate" \
                        -backend-config="region=${this.region}"`

  execSync(terraformCmd, {cwd: envDir, stdio: [0, 1, 2]})

  spinner.text = 'Done loading remote state'
  spinner.stop()
}

Context.prototype.run = function (callback) {
  const envDir = this.envDir()
  const runDir = this.runDir()
  const tfLocalCache = this.tfLocalCache()

  if (existsSync(envDir)) {
    process.chdir(envDir)
    console.log(chalk.blue('Running', chalk.bold.underline(this.project), `in ${envDir}`))

    if (!existsSync(tfLocalCache)) {
      this.configTerraformRemote(envDir)
    }

    console.log(chalk.cyan('Getting and installing terraform modules'))

    const updateModules = this.updateModules
    const getCmd = `terraform get -update=${updateModules}`

    execSync(getCmd, {cwd: envDir, stdio: [0, 1, 2]})

    callback(envDir, runDir, {assumeYes: this.assumeYes})
  } else {
    console.error(chalk.red(`Can't find environment ${this.env} directory: ${envDir}`))
  }
}

module.exports = function (argv) {
  return new Context(argv)
}
