const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const config = require('../config.js')

//密码加密
const cryptoPwd = function(password){
    const salt = 'yh'
    const saltPassword = password + ':' + salt
    const md5 = crypto.createHash('md5')
    const result = md5.update(saltPassword).digest('hex')
    return result;
}

//生成token
const getToken = function (payload= {} ) {
     var token = jwt.sign(payload, config.secret, {
        //  algorithm: 'HS256', //算法
         expiresIn: '2h' //Token过期时间
     });
     return token
}
//通过token获取JWT的payload,验证并解析JWT
const getJWTPayload = function(token) {
   return jwt.verify(token, config.secret, (error, decoded) => {
        if(error){
            console.log(error.message)
            return 
        }
        return decoded
    });


    
}
module.exports = {
    cryptoPwd,
    getToken,
    getJWTPayload
}