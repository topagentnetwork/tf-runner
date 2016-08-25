const mkdirp = require('mkdirp')
const touch = require('touch')

const config = require('./config')

exports.command = 'init'

exports.describe = 'Init directory structure for tf-runner'

exports.builder = argv => argv.env(config.envPrefix)

exports.handler = argv => {
  mkdirp.sync('infrastructure/environments/dev')
  mkdirp.sync('infrastructure/modules')
  mkdirp.sync('infrastructure/tmp')
  touch.sync('infrastructure/tmp/.gitkeep')
}
