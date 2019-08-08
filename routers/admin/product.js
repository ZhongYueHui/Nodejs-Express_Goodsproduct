const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
var md5s = require('../../md5')
var DB = require('../../modules/db')
const fs = require('fs')


//引入图片上传的插件
const multiparty = require('multiparty')

// //引入并配置body-parser中间件,并按需引入
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })

router.get('/', (req, res) => {
    DB.find('product', {}, (error, result) => {
        if (error) throw error
        res.render('admin/product/product', { List: result })
    })
})


//增加商品页面
router.get('/productadd', (req, res) => {
    res.render('admin/product/productadd')
})


//增加商品表单
router.post('/doproductadd', (req, res) => {
    var form = new multiparty.Form();
    form.uploadDir = 'uploadImages'  //上传图片的地址
    form.parse(req, function (err, fields, files) {
        if (err) throw err
        /*
        console.log(fields) //这个参数传递的是表单提交的信息，是一个对象，如用户名，密码，价格这种
        console.log("--------------------");
        console.log(files)//这个参数传递的是上传的文件信息，是一个数组对象，如上传文件的大小，路径，初始文件名
        */
        let tradename = fields.tradename[0]
        let price = fields.price[0]
        let postage = fields.postage[0]
        let description = fields.description[0]
        let image = files.image[0].path
        console.log(description);
        DB.insertOne('product', { //插入到数据库之中
            tradename,
            price,
            postage,
            image,
            description
        }, (err, result) => {
            if (err) throw err
            res.redirect('/admin/product')
        })
    })
})
//修改商品信息页面
router.get('/productedit', (req, res) => {
    res.render('admin/product/productedit')
})
//修改表单
router.get('/doproductedit', (req, res) => {
    let id = req.query.id
    DB.find('product', { "_id": new DB.ObjectID(id) }, (error, result) => {
        if (error) throw error
        res.render('admin/product/productedit', { List: result })
    })
})

//增加商品表单
router.post('/doproductadd', (req, res) => {
    var form = new multiparty.Form();
    form.uploadDir = 'uploadImages'  //上传图片的地址
    form.parse(req, function (err, fields, files) {
        if (err) throw err
        /*
        console.log(fields) //这个参数传递的是表单提交的信息，是一个对象，如用户名，密码，价格这种
        console.log("--------------------");
        console.log(files)//这个参数传递的是上传的文件信息，是一个数组对象，如上传文件的大小，路径，初始文件名
        */
        let tradename = fields.tradename[0]
        let price = fields.price[0]
        let postage = fields.postage[0]
        let description = fields.description[0]
        let image = files.image[0].path
        console.log(description);
        DB.insertOne('product', { //插入到数据库之中
            tradename,
            price,
            postage,
            image,
            description
        }, (err, result) => {
            if (err) throw err
            res.redirect('/admin/product')
        })
    })
})
//删除商品信息模块
router.get('/deleteproduct', (req, res) => {
    let id = req.query.id
    DB.deleteOne('product', { "_id": new DB.ObjectID(id) }, (err, result) => {
        if (err) throw err
        res.redirect('/admin/product')
    })
})

router.post('/doproducteidtupdate', (req, res) => {
    var form = new multiparty.Form();
    form.uploadDir = 'uploadImages'  //上传图片的地址
    form.parse(req, function (err, fields, files) {
        if (err) throw err
        /*
        console.log(fields) //这个参数传递的是表单提交的信息，是一个对象，如用户名，密码，价格这种
        console.log("--------------------");
        console.log(files)//这个参数传递的是上传的文件信息，是一个数组对象，如上传文件的大小，路径，初始文件名
        */
        let id = fields._id[0]  //使用隐藏表单域将id传递过来
        let tradename = fields.tradename[0]
        let price = fields.price[0]
        let postage = fields.postage[0]
        let description = fields.description[0]
        let image = files.image[0].path
        if (files.image[0].originalFilename == '') {  //判断是否上传了图片，没有上传则不更新图片地址
            var setData = {
                tradename,
                price,
                postage,
                description
            }
            fs.unlink(image, (err) => {  //如果没有上传图片 删除存放在uploadImages的临时文件
                if (err) throw err
            })
        } else {
            setData = {
                tradename,
                price,
                postage,
                image,
                description
            }
        }
        DB.updateOne('product', { "_id": new DB.ObjectID(id) }, setData, (err, result) => {
            if (err) throw err
            res.redirect('/admin/product')
        })
    })
})


module.exports = router
