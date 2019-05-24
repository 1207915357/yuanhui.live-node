/*
 * @Author: yuanhui 
 * @Email: 1207915357@qq.com
 * @Date: 2018-12-16 19:08:12 
 * @Last Modified by: yuanhui
 * @Last Modified time: 
 * @Description: article controller 
 */


const Article_col = require('../model/article');
const ArticleDraft_col = require('../model/article-draft'); 
const User_col = require('../model/user');
const Comment_col = require('../model/comments.js');
const Tag_col = require('../model/tag.js');
const Category_col = require('../model/category.js');
const uuidV1 = require('uuid/v1')
const passport = require('../utils/passport')

//文章操作--------------------------------------------------------------
//发布文章
const publish = async (ctx, next) => {
    const {
        value,
        title,
        pictureUrl,
        tags,
        category,
        authorId
    } = ctx.request.body

    try {
          const authorInfo = await User_col.findOne({userId:authorId})
          let author = {
              userId: authorInfo.userId,
              userName: authorInfo.userName
          }
        //category
        const categoryList = await Category_col.find()
        const temp = categoryList.find((obj) => {
            return obj.categoryName == category
        })
        if (temp) {
            await Category_col.updateOne({
                categoryName: category
            }, {
                $inc: {
                    count: 1
                }
            })
        } else {
            await Category_col.create({
                categoryName: category
            })
        }

        //tag
        const tagList = await Tag_col.find()
        for (let ele of tags) {
            const flag = tagList.find((obj) => {
                return obj.tagName.toLowerCase() == ele.toLowerCase()
            })
            if (flag) {
            await Tag_col.updateOne(
                {tagName:ele},
                {$inc:{count:1}}
            )
            } else {
                await Tag_col.create({
                    tagName: ele
                })
            }
        }

        const articleId = uuidV1();
        const newArticle = await Article_col.create({
            articleId,
            value,
            title,
            pictureUrl,
            tags,
            category,
            author
        })

        if (newArticle) {
            ctx.body = {
                code: 1,
                msg: 'success!',
                data: {
                    title,
                    articleId
                }
            };
        } else {
            ctx.body = {
                code: 0,
                msg: 'failed!'
            };
        }
        
    } catch (error) {
        console.log(error)
         ctx.body = {
             code: 0,
             data: error,
             msg: 'failed!'
         };
    }

  
}

//获取文章列表||草稿列表 
const articleList = async (ctx, next) =>{
    const type = ctx.request.body.type
    const tagName = ctx.request.body.tagName || undefined
    const categoryName = ctx.request.body.categoryName || undefined
    const rows = parseInt(ctx.request.body.rows) || 10
    const start = parseInt(ctx.request.body.start) || 0
    let articleList = '';
    if(type === 'article'){
        if (tagName) {
             articleList = await Article_col.find({
                tags: {$all: [tagName]}
            })
            .sort({ '_id': -1})
        }else if(categoryName){
            articleList = await Article_col.find({
                    category: {$all: [categoryName]}
            })
            .sort({'_id': -1 })
        }else{
             articleList = await Article_col.find()
            .skip(start)
            .limit(rows)
            .sort({'_id': -1 })

        }
    }else{
         articleList = await ArticleDraft_col.find()
        .sort({'_id': -1})
    }
     if (articleList) {
         ctx.body = {
             code: 1,
             msg: 'success!',
             data: [...articleList]
         };
     } else {
         console.log(articleList, 'error')
         ctx.body = {
             code: 0,
             msg: 'failed!'
         };
     }
}

//搜索文章
const searchArticle = async (ctx,next) =>{
    const keyWord = ctx.request.body.keyWord
    let list 
    if(keyWord == "hottest"){
         list = await Article_col
             .find()
             .sort({
                 eye : -1
             })
             .skip(0)
             .limit(6)
    }else if(keyWord == "newest"){
         list = await Article_col
             .find()
             .sort({
                 '_id': -1
             })
    }else{
        list = await Article_col
            .find({
                title: {
                    $regex: keyWord
                }
            })
            .sort({
                '_id': -1
            })
    }

    if(list){
        ctx.body = {
            code: 1,
            data:[...list],
            meg:'success'
        }
    }else{
         console.log(list, 'error')
         ctx.body = {
             code: 0,
             msg: 'failed!'
         };
    }
}

//封面图片上传
const uploadCover = async(ctx, next)=>{
     let pictureUrl = `http://${ctx.req.headers.host}/imgs/${ctx.req.file.filename}`
     ctx.body = {
        filename: ctx.req.file.filename, //返回文件名
        pictureUrl: pictureUrl  //url
     }
}

//markdown图片上传
const markdownImg = async (ctx, next) => {
    if(ctx.req.file){
        let url = `http://${ctx.req.headers.host}/imgs/${ctx.req.file.filename}`
        ctx.body = {
            code: 1,
            msg:'success!',
            data:{
                url: url, //返回url
            }
        }
    }else{
         ctx.body = {
             code: 0,
             msg:'failed!'
         }
    }
     
}

//查看文章详情||草稿详情
const articleDel = async (ctx, next) => {
    const {
        articleId,
        type,
        notAddEye
    } = ctx.request.body
    let articleDel = ""
    if(type==="article"){
        if (!notAddEye) {  // notAddEye为true时不增加查看次数
            await Article_col.updateOne({
                articleId
            }, {
                $inc: {
                    eye: 1
                }
            })
        }
        articleDel = await Article_col.findOne({
            articleId
        })

    }else{
        articleDel = await ArticleDraft_col.findOne({
            articleId
        })
    }
    if (articleDel) {
        ctx.body = {
            code: 1,
            msg: 'success!',
            data: articleDel
        };
    } else {
        ctx.body = {
            code: 200,
            msg: '文章已被删除!'
        };
    }
}

//编辑更新文章
const updateArticle = async (ctx, next) => {
    const {
        articleId,
        value,
        pictureUrl,
        title
    } = ctx.request.body
    const article = await Article_col.updateOne(
        {
            articleId
        }, 
        {
            value,
            title,
            pictureUrl
        }
    )
    if (article) {
        ctx.body = {
            code: 1,
            msg: 'success!',
            data: {
                data: article
            }
        }
    } else {
        ctx.body = {
            code: 0,
            msg: 'failed!'
        }
    }

}

//删除文章||草稿
const deleteArticle = async (ctx, next) => {
    try {
         const {
             articleId,
             type
         } = ctx.request.body
         let article = ""
         if (type === "article") {

             const theArticle = await Article_col.findOne({
                 articleId
             })
             //category
             const category = theArticle.category
              if(category){
                  let theCategory = await Category_col.findOne({
                      categoryName: category
                  })
                  let count_category = theCategory.count
                  count_category--
                  if (count_category == 0) {
                      await Category_col.deleteOne({
                          categoryName: category
                      })
                  } else {
                      await Category_col.updateOne({
                          categoryName: category
                      }, {
                          count: count_category
                      })
                  }
              }
             //tags
             const tags = theArticle.tags
             for (let ele of tags) {
                 let theTag = await Tag_col.findOne({
                     tagName: ele
                 })
                 let count = theTag.count
                 count--
                 if (count == 0) {
                     await Tag_col.deleteOne({
                         tagName: ele
                     })
                 } else {
                     await Tag_col.updateOne({
                         tagName: ele
                     }, {
                         count
                     })
                 }
             }

             article = await Article_col.deleteOne({
                 articleId
             })
         } else {
             article = await ArticleDraft_col.deleteOne({
                 articleId
             })
         }
         if (article) {
             ctx.body = {
                 code: 1,
                 msg: 'success!',
             }
         } else {
             ctx.body = {
                 code: 0,
                 msg: 'failed!'
             }
         }
    } catch (error) {
        console.log(error,'error')
        ctx.body = {
            code: 500,
            msg:'server error!'
        }
    }
   
}


//保存为草稿
const articleDraft = async(ctx,next) =>{
    const {
        articleId,
        value,
        title,
        pictureUrl
    } = ctx.request.body
    let newArticle = ""
    try {
        if (articleId) {
            //更新
            // console.log(articleId,'id')
             newArticle = await ArticleDraft_col.updateOne(
                {
                    articleId
                },
                {
                    value,
                    title,
                    pictureUrl
                }
            )
        }else{
            //保存
            const articleId = uuidV1();
            newArticle = await ArticleDraft_col.create({
                articleId,
                value,
                title,
                pictureUrl
            })
        } 
    }catch (e) {
        console.log(e, 'error')
    }
    // console.log(newArticle,'new')
    if (newArticle) {
        ctx.body = {
            code: 1,
            msg: 'success!',
        };
    } else {
        ctx.body = {
            code: 0,
            msg: 'failed!'
        };
    }
    
}

//文章点赞
const giveLike = async (ctx, next) => {
    const {
        userId,
        articleId
    } = ctx.request.body
    if(!userId){
        ctx.body={
            code:201,
            msg:"请先登陆",
            data:null
        }
        return
    }
    try {
         var user = await User_col.findOne({
             userId
         })
         var article = await Article_col.findOne({
             articleId
         })
         // var {user, article} = await Promise.all(
         //     User_col.findOne({id: userId}),
         //     Article_col.findOne({id: articleId})
         // )
         if (user) {
             let index = user.likeArticle.findIndex((val) => {
                 return val === articleId
             })
             let likeArticle = [],
                 like = ""
             if (index === -1) {
                 likeArticle = user.likeArticle
                 like = article.like + 1
                 likeArticle.push(articleId)
             } else {
                 likeArticle = user.likeArticle
                 like = article.like - 1
                 likeArticle.splice(index, 1)
             }
             await User_col.updateOne({
                 userId
             }, {
                 likeArticle
             })
             await Article_col.updateOne({
                 articleId
             }, {
                 like
             })
             ctx.body = {
                 code: 1,
                 msg: 'success!',
                 data: null
             }

         } else {
             ctx.body = {
                 code: 0,
                 msg: 'failed!',
             }
         }
    } catch (e) {
        console.log(e,'error')
         ctx.body = {
             code: 200,
             msg: 'server error!',
         }
    }
   
}


//文章评论
const comment = async (ctx, nest) =>{
    const payload = passport.getJWTPayload(ctx.headers.authorization)
    if(!payload){
        console.log('token error （comment）!')
        ctx.status = 403
        return
    }
    const {
        userId,
        articleId,
        content,
    } = ctx.request.body
    if(!userId||!articleId||!content){
        ctx.body = {
            code:0,
            msg:'缺少必要参数！'
        }
       return 
    }

    try{
         const user = await User_col.findOne({
             userId
         })
         const commentId = uuidV1();
         let theUser = {
             userId: user.userId,
             userName: user.userName,
             type:user.type
         }
         await Comment_col.create({
             commentId,
             articleId,
             userId,
             //评论的用户
             user: theUser,
             content,
             //子评论
             sub_comment: [],
         })
         const commentList = await Comment_col.find({
             articleId
         }).sort({
             '_id': -1
         })
         
         const article = await Article_col.updateOne({
            articleId
         }, {
             commentList,
             $inc:{comments:1}
         })

         if (article) {
             ctx.body = {
                 code: 1,
                 msg: 'success',
                 data: null
             }
         } else {
             ctx.body = {
                 code: 0,
                 msg: 'failed',
             }
         }

    }catch(e){
        console.log(e,'error')
        ctx.body = {
            code: 200,
            msg: '服务器错误',
        }

    }

}


//子评论
const subComment = async (ctx, nest) => {
    const {
        userId,
        toUserId,
        articleId,
        commentId,
        content,
    } = ctx.request.body
    if (!userId || !toUserId || !articleId || !commentId || !content) {
        ctx.body = {
            code: 0,
            msg: '缺少必要参数！'
        }
        return
    }
    try {
        const user = await User_col.findOne({
            userId
        })
        const toUser = await User_col.findOne({
            userId:toUserId
        })
         let theUser = {
             userId: user.userId,
             userName: user.userName,
             type:user.type
         }
          let theToUser = {
              userId: toUser.userId,
              userName: toUser.userName,
              type: toUser.type
          }
        const result_comment = await Comment_col.findOne({
            commentId
        })
        let sub_comment = result_comment.sub_comment
        sub_comment.push(
            {
                user: theUser,
                toUser: theToUser,
                content,
            }
        ) 
        await Comment_col.updateOne(
            {
                commentId
            },
            {
                sub_comment
            })

        const commentList = await Comment_col.find({
            articleId
        }).sort({
            '_id': -1
        })
        const article = await Article_col.updateOne({
            articleId
        }, {
            commentList,
            $inc:{comments:1}
        })

        if (article) {
            ctx.body = {
                code: 1,
                msg: 'success',
                data: null
            }
        } else {
            ctx.body = {
                code: 0,
                msg: 'failed',
            }
        }

    } catch (e) {
        console.log(e, 'error')
        ctx.body = {
            code: 200,
            msg: '服务器错误',
        }
    }

}

const getCommentList = async(ctx,next)=>{
    //token认证
    const {row,start} = ctx.request.body; 
    const commentList  = await Comment_col.find()
    .skip(+start)  // 转化成number
    .limit(+row)
    .sort({'_id':-1})
    if(commentList){
        ctx.body = {
            code: 1,
            msg: 'success',
            data: commentList
        }
    }
}

module.exports = {
    publish,
    articleList,
    searchArticle,
    updateArticle,
    deleteArticle,
    articleDel,
    uploadCover,
    markdownImg,
    articleDraft, //草稿保存
    giveLike,
    comment,
    subComment,
    getCommentList,
}