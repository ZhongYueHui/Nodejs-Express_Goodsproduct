exports.md5 = function (str) { //暴露出md5s方法
    var crypto = require('crypto')  //加载加密文件
    var md5 = crypto.createHash('md5')
    md5.update(str)
    str = md5.digest('hex')
    return str
}