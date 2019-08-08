const express = require('express')
const router = express.Router()
const DB = require('../../modules/db')
const bodyParser = require('body-parser')
const md5s = require('../../md5')
// //引入并配置body-parser中间件,并按需引入
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })


//用户页面
router.get('/', (req, res) => {
    DB.find('user', {}, (err, result) => {
        if (err) throw err
        res.render('admin/user/userinfo', { List: result })
    })
})

//删除用户
router.get('/deleteuser', (req, res) => {
    let id = req.query.id
    DB.deleteOne('user', { "_id": new DB.ObjectID(id) }, (err, result) => {
        if (err) throw err
        res.redirect('/admin/product/product')
    })
})
//更新用户数据页面
router.get('/updateuser', (req, res) => {
    let id = req.query.id
    DB.find('user', { "_id": new DB.ObjectID(id) }, (err, result) => {
        if (err) throw err
        res.render('admin/user/useredit', { List: result[0] })  //将用户数据传递到编辑页面中
    })
})
router.post('/updateuserinfo', urlencodedParser, (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body))
    body.password = md5s.md5(body.password)
    DB.updateOne('user', { "_id": new DB.ObjectID(body._id) }, { "password": body.password }, (err, result) => {
        if (err) throw err
        res.redirect('/admin/user') //修改密码完成后返回用户列表
    })
})
module.exports = router