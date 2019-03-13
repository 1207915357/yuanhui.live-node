const mongoose = require('mongoose')
const Schema = mongoose.Schema

const articleSchema = new Schema({
    articleId:{
    	type: String,
    	required: true
    },
    value: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    pictureUrl: {
        type: String
    },
    tags: {
        type: Array,
        required: true
    },
    created_time: {
        type: Date,
        default: Date.now
    },
    eye:{
        type: Number,
        default: 0
    },
    like: {
        type: Number,
        default: 0
    },
    comments: {
        type: Number,
        default: 0
    },
    commentList: {
        type: Array,
    },
    

})

module.exports = mongoose.model('Article', articleSchema)