const Tag_col = require('../model/tag.js');

const getTagList = async(ctx,next) =>{
    const tagList = await Tag_col.find()
    if(tagList){
            ctx.body = {
                code: 1,
                data: tagList,
                msg:'success!'
            }
        }else{
            ctx.body = {
                code: 0,
                msg: 'failed!'
            }
        }
    }


module.exports = {
    getTagList
}