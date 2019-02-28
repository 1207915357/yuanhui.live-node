const crypto = require('crypto')

const cryptoPwd = function(password){
    const salt = 'yh'
    const saltPassword = password + ':' + salt
    const md5 = crypto.createHash('md5')
    const result = md5.update(saltPassword).digest('hex')
    return result;
}
module.exports = {
    cryptoPwd
}