const mongoose = require('mongoose')
const Schema = mongoose.Schema

const articleDraftSchema = new Schema({
    articleId: {
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
    },
    created_time: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('ArticleDraft', articleDraftSchema)