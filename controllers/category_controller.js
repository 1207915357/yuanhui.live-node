const Category_Col = require('../model/category.js')

const getCategoryList = async(ctx,next)=>{
     const categoryList = await Category_Col.find()
     if (categoryList) {
         ctx.body = {
             code: 1,
             data: categoryList,
             msg: 'success!'
         }
     } else {
         ctx.body = {
             code: 0,
             msg: 'failed!'
         }
     }
}

module.exports = {
    getCategoryList
}