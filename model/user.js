const mongoose = require('mongoose')
// mongoose.connect('mongodb://localhost/yuanhui-live',{useNewUrlParser: true});
const Schema = mongoose.Schema

const userSchema = new Schema({
	// email:{
	// 	type: String,
	// 	required: true
	// },
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
	// avatar:{
	// 	type: String,
	// 	// default: '/public/img/avatar-default.png'
	// 	default: ''
	// },
	created_time:{
		type: Date,
		default: Date.now
	},
	likeArticle:{
		type:Array,
	}

})

module.exports = mongoose.model('User', userSchema)