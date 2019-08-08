const express = require('express')
const app = express()
const session = require('express-session')
const port = 3000

const admin = require('./routers/admin')
const index = require('./routers/index')

//表示使用ejs模板引擎，当然你也可以使用art-template模板引擎
app.set('view engine', 'ejs')
app.use(express.static('./public'))
app.use('/uploadImages', express.static('./uploadImages'))//配置图片地址文件夹
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30,
    },
    rolling: true
}))

app.use('/', index)
app.use('/admin', admin)



app.listen(port, () => console.log(`http://localhost:` + port))