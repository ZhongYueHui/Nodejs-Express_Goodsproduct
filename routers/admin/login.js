const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const DB = require('../../modules/db')
const md5s = require('../../md5')

// //引入并配置body-parser中间件,并按需引入
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })

//登陆页面
router.get('/', (req, res) => {
    res.render('admin/login/login')
})

//验证登陆表单
router.post('/dologin', urlencodedParser, (req, res) => {
    //将数据重新转换一下，因为req.body有一些没有作用的数据
    let body = JSON.parse(JSON.stringify(req.body))
    DB.find('user', { "username": body.username, "password": md5s.md5(body.password) }, (err, result) => {
        if (err) throw err
        if (result.length > 0) {//如果大于0表示有数据
            req.session.userinfo = result[0]  //将用户数据保存到session中
            res.status = 200
            res.redirect('/admin/product')
        } else {//如果等于0表示没有数据
            res.status = 300
            res.send('<script>alert(\'用户名或密码错误\');location.href="/admin/login"</script>')
        }
    })
})
//注册页面
router.get('/resgin', (req, res) => {
    res.render('admin/login/resgin')
})

//注册表单
router.post('/resgin', urlencodedParser, (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body))
    body.password = md5s.md5(body.password)  //将密码进行加密
    DB.find('user', { "username": body.username }, (err, result) => {
        if (err) throw err
        if (result.length > 0) {//如果大于0表示有数据,不能注册
            res.send('<script>alert("此用户已被注册");location.href="/admin/resgin"</script>')
        } else {//如果等于0表示没有数据
            DB.insertOne('user', body, (err, result) => {
                if (err) throw err
                res.send('<script>alert("注册成功，即将前往登陆页面");location.href="/admin/login"</script>')

            })
        }
    })
})
//退出
router.get('/loginout', (req, res) => {
    //销毁session
    req.session.destroy(err => {
        if (err) throw err
        res.redirect('admin/login')
    })
})
//暴露这个模块
module.exports = router