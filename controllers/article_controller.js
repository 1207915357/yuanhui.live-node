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
const uuidV1 = require('uuid/v1')


//文章操作--------------------------------------------------------------
//发布文章
const publish = async (ctx, next) => {
    const {
        value,
        title,
        pictureUrl,
        tags
    } = ctx.request.body

    try {
          const tagList = await Tag_col.find()
          for (let ele of tags) {
              const flag = tagList.find((obj) => {
                  return obj.tagName == ele
              })
            //   console.log(flag, 'flag')
              if (flag) {
                  let theTag = await Tag_col.findOne({
                      tagName: ele
                  })
                  let count = theTag.count
                  count++
                  await Tag_col.updateOne({
                      tagName: ele
                  }, {
                      count
                  })
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
              tags
          })

          if (newArticle) {
              ctx.body = {
                  code: 1,
                  msg: 'success!',
                  data: {}
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
    const rows = parseInt(ctx.request.body.rows) || 10
    const start = parseInt(ctx.request.body.start) || 0
    
    if(type === 'article'){
        if (tagName) {
            // const tagName = ctx.request.body.tagName
            var articleList = await Article_col.find({
                tags: {$all: [tagName]}
            })
            .sort({ '_id': -1})
        }else{
            var articleList = await Article_col.find()
            .skip(start)
            .limit(rows)
            .sort({'_id': -1 })

        }
    }else{
        var articleList = await ArticleDraft_col.find()
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
    const {articleId,type} = ctx.request.body
    let articleDel = ""
    if(type==="article"){
       let article = await Article_col.findOne({
            articleId
        })
        let eye = article.eye
        eye ++
        await Article_col.updateOne(
            {articleId},
            {eye}
        )
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
            code: 0,
            msg: 'failed!'
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
             const tags = theArticle.tags
            //  console.log(tags, 'tags')
             for (let ele of tags) {
                 let theTag = await Tag_col.findOne({
                     tagName: ele
                 })
                //  console.log(theTag, 'theTag')
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
    const {
        userId,
        articleId,
        content,
        author
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
         const theArticle = await Article_col.findOne({articleId})
         let comments = theArticle.comments
         comments = comments + 1 
         const article = await Article_col.updateOne({
            articleId
         }, {
             commentList,
             comments
         })

         //通知作者
        const authorInfo =  await User_col.findOne({userId:author.userId})
        let noticeObj = {
            content,
            user:theUser,
            toUser:author,
            type: 'comment',
            articleId,
            articleTitle: theArticle.title
        }
        let commentNotice = authorInfo.commentNotice
        let unreadNum = authorInfo.unreadNum
        commentNotice.push(noticeObj)
        unreadNum++
        let updateAuthor = await User_col.updateOne(
            {userId:author.userId},
            {
                commentNotice,
                unreadNum,
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
        toContent,
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
         }
          let theToUser = {
              userId: toUser.userId,
              userName: toUser.userName,
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
        const theArticle = await Article_col.findOne({
            articleId
        })
        let comments = theArticle.comments
        comments = comments + 1
        const article = await Article_col.updateOne({
            articleId
        }, {
            commentList,
            comments
        })
        
        //通知评论用户
        // const theToUserInfo = await User_col.findOne({
        //     userId: theToUser.userId
        // })
        let noticeObj = {
            toContent,
            content,
            user: theUser,
            toUser: theToUser,
            type: 'answer',
            articleId,
            articleTitle: theArticle.title
        }
        let commentNotice = toUser.commentNotice
        let unreadNum = toUser.unreadNum
        commentNotice.push(noticeObj)
        unreadNum++
        let updateToUser = await User_col.updateOne({
            userId: toUserId
        }, {
            commentNotice,
            unreadNum,
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

//消息通知
const getNotice = async (ctx,nest) =>{
    const userId = ctx.request.body.userId
    const user = await User_col.findOne({userId})
    if(user){
        ctx.body = {
            code: 1,
            msg: 'success',
            data:{  
                commentNotice:user.commentNotice.reverse(),
                unreadNum:user.unreadNum,
            }
        }
    }else{
         console.log(user, 'error')
         ctx.body = {
                 code: 200,
                 msg: '服务器错误',
        }
    
    }
}

//消息已读
 const readedNotice = async (ctx,nest)=>{
    const userId = ctx.request.body.userId
    const user = await User_col.updateOne({
        userId
    },{
        unreadNum: 0
    })
    if (user) {
        ctx.body = {
            code: 1,
            msg: 'success',
            data: {}
        }
    } else {
        console.log(user, 'error')
        ctx.body = {
            code: 200,
            msg: '服务器错误',
        }
    }
 }

 //清除消息
 const clearNotice = async (ctx, nest) => {
     const userId = ctx.request.body.userId
     const user = await User_col.updateOne({
         userId
     }, {
         commentNotice: []
     })
     if (user) {
         ctx.body = {
             code: 1,
             msg: 'success',
             data: {}
         }
     } else {
         console.log(user, 'error')
         ctx.body = {
             code: 200,
             msg: '服务器错误',
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
    getNotice,
    readedNotice,
    clearNotice
}