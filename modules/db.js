//连接数据库
const MongoClient = require('mongodb').MongoClient;
//地址
const url = 'mongodb://localhost:27017'

//获取数据的id
const ObjectID = require('mongodb').ObjectID

function DB(callback) {  //创建一个连接数据库的函数
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err
        let dbname = db.db('goodsproduct')
        callback(err, dbname) //如果连接成功就将数据库返回出去
        db.close()
    })
}

//封装查找的方法并暴露出去  参数一:表名 参数二：查找的条件 参数三：回调函数
exports.find = function (collections, data, backFunction) {
    DB((err, dbname) => {//这里获取DB的callback的返回数据，进行数据表的查找
        dbname.collection(collections).find(data).toArray((error, result) => {
            backFunction(error, result)//将查找到的结果使用形参返出去
        })
    })
}
//插入数据
exports.insertOne = function (collection, data, backFunction) {  //插入数据的方法
    DB((err, dataName) => {
        dataName.collection(collection).insertOne(data, (error, result) => {
            if (error) throw err
            backFunction(error, result) //将插入的结果传递到形参中
        })
    })
}
//修改数据
exports.updateOne = function (collection, data, updatedata, backFunction) {  //插入数据的方法
    DB((err, dataName) => {
        dataName.collection(collection).updateOne(data, { $set: updatedata }, (error, result) => {
            if (error) throw err
            backFunction(error, result) //将插入的结果传递到形参中
        })
    })
}
//删除数据
exports.deleteOne = function (collection, data, backFunction) {  //插入数据的方法
    DB((err, dataName) => {
        dataName.collection(collection).deleteOne(data, (error, result) => {
            if (error) throw err
            backFunction(error, result) //将插入的结果传递到形参中
        })
    })
}

//暴露ObjectID，使用方法 
// {"_id":new DB.ObjectID(id)}
exports.ObjectID = ObjectID