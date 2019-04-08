const mongoose = require('mongoose')
// mongoose.connect('mongodb://localhost/yuanhui-live',{useNewUrlParser: true});
const Schema = mongoose.Schema

const userSchema = new Schema({
	userId:{
		type: String,
		required: true
	},
	userName:{
		type: String,
		required: true
	},
	password:{
		type: String,
		required: true
	},
	avatar:{
		type: String,
		// default: '/public/img/avatar-default.png'
		default: 'user'
	},
	created_time:{
		type: Date,
		default: Date.now
	},
	likeArticle:{
		type:Array,
	},
	unreadNum: { //未读通知条数
		type: Number,
		default: 0,
		required: true
	},
	// readed: { //是否查看未读通知
	// 	type: Boolean,
	// 	default: true
	// },
	// 通知
	commentNotice: [
		{
			type:{
				type:String, // comment 评论文章 || answer 回复评论 || notice 通知
				required:true
			},
			articleId:{
				type:String,
				// required:true
			},
			articleTitle:{
				type:String,
				// required:true
			},
			content: {
				type: String,
				required: true,
				validate: /\S+/
			},
			toContent:{ //被回复的评论
				type:String,
				// required:true
				validate: /\S+/
			},
			user: {
				userId: {
					type: String
				},
				userName: {
					type: String
				},
				type: {
					type: Number,
					default: 1
				}, // 0作者|| 1用户,
				avatar: {
					type: String,
					default: 'user'
				}
			},
			toUser: {
				userId: {
					type: String
				},
				userName: {
					type: String
				},
				type: {
					type: Number,
					default: 1
				}, // 0作者|| 1用户,
				avatar: {
					type: String,
					default: 'user'
				}
			},
			created_time: {
				type: Date,
				default: Date.now
			},
		}
	]


})

module.exports = mongoose.model('User', userSchema)