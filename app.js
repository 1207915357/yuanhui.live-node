const Koa = require('koa')
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const koaStatic = require('koa-static');
const mongoose = require('mongoose');
const config = require('./config.js');

const user_router = require('./api/user-router.js');
const article_router = require('./api/article-router.js');
const tag_router = require('./api/tag-router.js');

const app = new Koa();

mongoose.connect(config.db, {useNewUrlParser:true}, (err) => {
    if (err) {
        console.error('Failed to connect to database');
    } else {
        console.log('Connecting database successfully');
    }
});


app
//跨域
.use(cors())
//开放静态资源
.use(koaStatic(__dirname + '/public'))
//请求参数格式化
.use(bodyParser())
//路由
.use(user_router.routes()).use(user_router.allowedMethods())
.use(article_router.routes()).use(article_router.allowedMethods())
.use(tag_router.routes()).use(tag_router.allowedMethods())

//启动服务监听端口
.listen(config.port,function(){
    console.log(`server is running ${config.port}`)
});
