const fs = require('fs')

exports.existsSync = fileOrDir => {
  try {
    fs.statSync(fileOrDir)
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false
    }
    throw e
  }
  return true
}
