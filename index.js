const yargs = require('yargs')
const config = require('./lib/config')

const envPrefix = config.envPrefix

yargs.env(config.envPrefix).option('E', {
  alias: 'env',
  global: true,
  type: 'string',
  demand: true,
  description: `Environment to run terraform in. Overrides ${envPrefix}_ENV`
})
.option('P', {
  alias: 'project',
  global: true,
  type: 'string',
  demand: true,
  description: `Name of the project. Overrides ${envPrefix}_PROJECT`
})
.option('B', {
  alias: 's3-bucket',
  global: true,
  type: 'string',
  demand: true,
  description: `Name of bucket to store terraform's remote state. Overrides ${envPrefix}_S3_BUCKET`
})
.option('root', {
  global: true,
  type: 'string',
  default: process.cwd(),
  demand: true,
  description: `The root directory to run terraform commands in. Overrides ${envPrefix}_ROOT`,
})
.option('U', {
  alias: 'update-modules',
  global: true,
  type: 'boolean',
  default: false,
  demand: false,
  description: 'Check downloaded modules and update if necessary'
})
.option('R', {
  alias: 'aws-region',
  global: true,
  type: 'string',
  default: 'us-east-1',
  demand: true,
  description: `AWS region to use for storing terraform's remote state. Overrides ${envPrefix}_AWS_REGION`
})
.option('Y', {
  alias: 'assume-yes',
  global: true,
  type: 'boolean',
  default: false,
  demand: false,
  description: 'Do not ask for confirmation for any command and assume the answer is always yes'
})
.option('verbose', {
  global: true,
  type: 'boolean',
  default: false,
  description: 'Print out extra information while running'
})
.wrap(Math.min(120, yargs.terminalWidth()))
.help()
.version()
.command(require('./lib/bootstrap'))
.command(require('./lib/plan'))
.command(require('./lib/destroy'))
.command(require('./lib/apply'))
.command(require('./lib/show'))
.command(require('./lib/output'))
.command(require('./lib/validate')).argv
