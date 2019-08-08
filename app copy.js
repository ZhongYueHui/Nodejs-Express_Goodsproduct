const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
var md5s = require('./md5')
const app = express()
const port = 3000
var DB = require('./modules/db')
const fs = require('fs')

// //引入并配置body-parser中间件,并按需引入
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })

//引入图片上传的插件
const multiparty = require('multiparty')

//表示使用ejs模板引擎，当然你也可以使用art-template模板引擎
app.set('view engine', 'ejs')
app.use(express.static('./public'))  //配置静态文件夹，这样可以直接访问这个文件夹里面的内容
app.use('/uploadImages', express.static('./uploadImages'))//配置图片地址文件夹
app.use('node_modules', express.static('./node_modules'))//配置静态文件夹
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30,
    },
    rolling: true
}))

//自定义权限查看中间件，如果没有登陆则不能访问某些页面
app.use((req, res, next) => {

    if (req.url == '/login' || req.url == '/dologin' || req.url == '/resgin' || req.url == '/doresgin') {  //除去这两个
        next()
    } else {
        if (req.session.userinfo && req.session.userinfo.username != '') {  //判断是否有用户信息
            //使用ejs设置全局属性，可以在任意的ejs模板中获取
            app.locals['userinfo'] = req.session.userinfo
            next()
        } else {
            res.redirect('/login')
        }
    }
})

app.get('/', (req, res) => {
    res.redirect('/product')
})

//登陆页面
app.get('/login', (req, res) => {
    res.render('login') //渲染登陆页面，可以不需要写后缀名，因为在中间件中配置了ejs文件
})

//获取商品信息
app.get('/product', (req, res) => {
    DB.find('product', {}, (error, result) => {
        if (error) throw error
        res.render('product', { List: result })
    })
})

//增加商品页面
app.get('/productadd', (req, res) => {
    res.render('productadd')
})

//增加商品表单
app.post('/doproductadd', (req, res) => {
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
            res.redirect('/product')
        })
    })
})
//修改商品信息页面
app.get('/productedit', (req, res) => {
    res.render('productedit')
})

//登陆表单
app.post('/doLogin', urlencodedParser, (req, res) => {
    //将数据重新转换一下，因为req.body有一些没有作用的数据
    let body = JSON.parse(JSON.stringify(req.body))
    DB.find('user', { "username": body.username, "password": md5s.md5(body.password) }, (err, result) => {
        if (err) throw err
        if (result.length > 0) {//如果大于0表示有数据
            req.session.userinfo = result[0] //将用户数据保存到session中
            res.status = 200
            res.redirect('/')
        } else {//如果等于0表示没有数据
            res.status = 300
            res.send('<script>alert(\'用户名或密码错误\');location.href="/login"</script>')
        }
    })
})

//注册页面
app.get('/resgin', (req, res) => {
    res.render('resgin')
})

//注册表单
app.post('/doresgin', urlencodedParser, (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body))
    body.password = md5s.md5(body.password)  //将密码进行加密
    DB.find('user', { "username": body.username }, (err, result) => {
        if (err) throw err
        if (result.length > 0) {//如果大于0表示有数据,不能注册
            res.send('<script>alert("此用户已被注册");location.href="/resgin"</script>')
        } else {//如果等于0表示没有数据
            DB.insertOne('user', body, (err, result) => {
                if (err) throw err
                res.send('<script>alert("注册成功，即将前往登陆页面");location.href="/login"</script>')

            })
        }
    })
})

//登陆
app.get('/loginout', (req, res) => {
    //销毁session
    req.session.destroy(err => {
        if (err) throw err
        res.redirect('/login')
    })
})

//删除商品信息模块
app.get('/deleteproduct', (req, res) => {
    let id = req.query.id
    DB.deleteOne('product', { "_id": new DB.ObjectID(id) }, (err, result) => {
        if (err) throw err
        res.redirect('/product')
    })
})

app.get('/doproductedit', (req, res) => {
    let id = req.query.id
    DB.find('product', { "_id": new DB.ObjectID(id) }, (error, result) => {
        if (error) throw error
        res.render('productedit', { List: result })
    })
})
app.post('/doproducteidtupdate', (req, res) => {
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
            res.redirect('/product')
        })
    })
})
app.listen(port, () => console.log(`Example app listening on port port!`))