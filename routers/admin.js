const express = require('express')
const router = express.Router()

//引入模块
const login = require('../routers/admin/login')
const product = require('./admin/product.js')
const user = require('../routers/admin/user')

router.use((req, res, next) => {
    if (req.url == '/login' || req.url == '/login/dologin' || req.url == '/login/resgin' || req.url == '/logoin/doresgin') {  //除去这两个
        next()
    } else {
        if (req.session.userinfo && req.session.userinfo.username != '') {  //判断是否有用户信息
            //使用ejs设置全局属性，可以在任意的ejs模板中获取
            req.app.locals['userinfo'] = req.session.userinfo
            next()
        } else {
            res.redirect('/admin/login')
        }
    }
})


//配置路由中间件，到时候只需要http://localhost:3000/admim/login就可以访问login模块的路由
router.use('/login', login)
router.use('/product', product)
router.use('/user', user)
//暴露这个模块
module.exports = router