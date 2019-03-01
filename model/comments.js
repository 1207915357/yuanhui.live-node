const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentsSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    article: {
        type: String,
        required: true
    },
    created_time: {
        type: Date,
        default: Date.now
    },

})

module.exports = mongoose.model('Comment', commentsSchema)