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
     category: {
         type: String,
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
    // commentList: {
    //     type: Array,
    // },
    author: {
        userId: {
            type: String,
            default: '950dac10-3fc1-11e9-bed4-1134d355bff7'
        },
        userName:{
            type: String,
            default: 'yh'
        }
    }
    

})

module.exports = mongoose.model('Article', articleSchema)