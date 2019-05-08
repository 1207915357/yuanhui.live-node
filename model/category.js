const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
    categoryName: {
        type:String,
        required:true,
        validate: /\S+/
    },
    count: {
             type: Number,
             default: 1
    },
    created_time: {
        type: Date,
        default: Date.now
    },
    update_time: {
        type: Date,
        default: Date.now
    },

})

module.exports = mongoose.model('Category',categorySchema)

