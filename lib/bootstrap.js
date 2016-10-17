const chalk = require('chalk')
const aws = require('aws-sdk')
const s3 = new aws.S3()

const config = require('./config')

exports.command = 'bootstrap'

exports.describe = 'Bootstrap an s3 bucket to store terraform\'s state remotely'

exports.builder = argv => {
  return argv.env(config.envPrefix)
}
const createBucket = (bucket, callback) => {
  s3.createBucket({Bucket: bucket, ACL: 'private'}, err => {
    if (err) {
      console.log(chalk.red(err), err.stack)
      callback(err)
    } else {
      console.log(chalk.green(`Created bucket ${bucket} successfully`))
      callback(null, bucket)
    }
  })
}

const versionBucket = (bucket, callback) => {
  const params = {Bucket: bucket, VersioningConfiguration: {Status: 'Enabled'}}
  s3.putBucketVersioning(params, err => {
    if (err) {
      console.log(chalk.red(`Failled to enable versioning on the bucket. ${err}`))
      callback(err)
    } else {
      console.log(chalk.green(`Enabled versioning on bucket ${bucket}`))
      callback(null, bucket)
    }
  })
}

exports.handler = argv => {
  const bucket = argv.s3Bucket

  s3.headBucket({Bucket: bucket}, err => {
    if (err) {
      if (err.code === 'NotFound') {
        console.log(chalk.yellow(`Bucket ${bucket} does not exist, creating...`))
        createBucket(bucket, (err, bucket) => {
          if (!err) {
            versionBucket(bucket, () => {
            })
          }
        })
      } else {
        console.log(chalk.red(err), err.stack)
      }
    }
  })
}
