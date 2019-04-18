const Koa = require('koa')
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const koaStatic = require('koa-static');
const mongoose = require('mongoose');
const config = require('./config.js');
const http = require('http')

const user_router = require('./api/user-router.js');
const article_router = require('./api/article-router.js');
const tag_router = require('./api/tag-router.js');
const notice_router = require('./api/notice-router.js');    

const app = new Koa();

mongoose.connect(config.db, {useNewUrlParser:true}, (err) => {
    if (err) {
        console.error('Failed to connect to database');
    } else {
        console.log('Connecting database successfully');
    }
});


const server =  
app
//跨域
.use(cors({
     origin: function (ctx) {
             if (ctx.url === '/test') {
                 return "*" // 允许来自所有域名请求
             }
             return 'http://localhost:8888' // 这样就能只允许 http://localhost:8080 这个域名的请求了
         },
         credentials: true,
         allowMethods: ['GET', 'POST', 'DELETE'],
         allowedHeaders: [ 'Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
}))
//开放静态资源
.use(koaStatic(__dirname + '/public'))
//请求参数格式化
.use(bodyParser())
//路由挂载
.use(user_router.routes()).use(user_router.allowedMethods())
.use(article_router.routes()).use(article_router.allowedMethods())
.use(tag_router.routes()).use(tag_router.allowedMethods())
.use(notice_router.routes()).use(notice_router.allowedMethods())

//启动服务监听端口
.listen(config.port,function(){
    console.log(`server is running ${config.port}`)
});


// socket.io
// const server = http.createServer(app)
// const io = require('socket.io')(server);
// io
// // .of('/notice')
// .clients((error, clients) => {
//     if (error) throw error;
//     console.log(clients, 'client'); // => [Anw2LatarvGVVXEIAAAD]
// })
// .on('connection', function (socket) {
//     const socketId = socket.id
//     //登录时建立一个userName 到 socketId 的映射表
//     // socket.broadcast.emit('user connected');
//     socket.on('login',(userName) =>{})

//     socket.emit('news', {
//         news: 'new comment'
//     });
//     socket.on('clientEvent', function (data) {
//         console.log(data);
//     });
// })

