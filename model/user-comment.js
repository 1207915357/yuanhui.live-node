// const mongoose = require('mongoose')
// const Schema = mongoose.Schema

// //用户评论表
// const userCommentSchema = new Schema({
//     userId:{
//         type:String,
//         required:true
//     },
//     unreadNum:{  //未读通知条数
//         type:Number,
//         default:0,
//         required:true
//     },
//      readed: { //是否查看未读通知
//          type: Boolean,
//          default: true
//      },
//     commentList:[
//         {
//            toUser:{
//                 userId: {
//                     type: String
//                 },
//                 userName: {
//                     type: String
//                 },
//                 type: {
//                     type: Number,
//                     default: 1
//                 }, // 0作者|| 1用户,
//                 avatar: {
//                     type: String,
//                     default: 'user'
//                 }
//            } ,
//            content:{
//                 type: String,
//                 required: true,
//                 validate: /\S+/
//            },
//             created_time: {
//                 type: Date,
//                 default: Date.now
//             },
//         }
//     ]

// })

// module.exports = mongoose.model('UserComment', userCommentSchema)