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
const uuidV1 = require('uuid/v1')


//文章操作--------------------------------------------------------------
//发布文章
const publish = async (ctx, next) => {
    const req = ctx.request.body
    const articleId = uuidV1();
    const newArticle = await Article_col.create({
        articleId,
        value: req.value,
        title: req.title,
        pictureUrl: req.pictureUrl
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
}

//获取文章列表||草稿列表 
const articleList = async (ctx, next) =>{
    const type = ctx.request.body.type
    if(type === 'article'){
        var articleList = await Article_col.find()
    }else{
        var articleList = await ArticleDraft_col.find()
    }
     if (articleList) {
         ctx.body = {
             code: 1,
             msg: 'success!',
             data: [...articleList.reverse()]
         };
     } else {
         console.log(articleList, 'error')
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
    const {id,type} = ctx.request.body
    let articleDel = ""
    if(type==="article"){
        articleDel = await Article_col.findOne({
            id
        })
    }else{
        articleDel = await ArticleDraft_col.findOne({
            id
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
        id,
        value,
        pictureUrl,
        title
    } = ctx.request.body
    const article = await Article_col.updateOne(
        {
            id
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
    const {id,type} = ctx.request.body
    let article = ""
    if(type==="article"){
         article = await Article_col.deleteOne({
            id: id
        })
    }else{
        article = await ArticleDraft_col.deleteOne({
            id: id
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
}


//保存为草稿
const articleDraft = async(ctx,next) =>{
    const {id,value,title,pictureUrl} = ctx.request.body
    let newArticle = ""
    try {
        if(id){
            //更新
             newArticle = await ArticleDraft_col.updateOne(
                {
                    id
                },
                {
                    value,
                    title,
                    pictureUrl
                }
            )
        }else{
            //保存
            const id = uuidV1();
            newArticle = await ArticleDraft_col.create({
                id,
                value,
                title,
                pictureUrl
            })
        } 
    }catch (e) {
        console.log(e, 'error')
    }
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
         await Comment_col.create({
             commentId,
             articleId,
             userId,
             //评论的用户
             user: {
                 userId: user.userId,
                 userName: user.userName,
             },
             content,
             //子评论
             sub_comment: [],
         })
         const commentList = await Comment_col.find({
             articleId
         })
         const result = await Article_col.findOne({articleId})
         let comments = result.comments
         comments = comments + 1 
         const article = await Article_col.updateOne({
            articleId
         }, {
             commentList:commentList.reverse(),
             comments
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
        const result_comment = await Comment_col.findOne({
            commentId
        })
        let sub_comment = result_comment.sub_comment
        sub_comment.push(
            {
                user: {
                    userId: user.userId,
                    userName: user.userName,
                },
                toUser: {
                    userId: toUser.userId,
                    userName: toUser.userName,
                },
                content
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
        })
        const result_article = await Article_col.findOne({
            articleId
        })
        let comments = result_article.comments
        comments = comments + 1
        const article = await Article_col.updateOne({
            articleId
        }, {
            commentList: commentList.reverse(),
            comments
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


module.exports = {
    publish,
    articleList,
    updateArticle,
    deleteArticle,
    articleDel,
    uploadCover,
    markdownImg,
    articleDraft, //草稿保存
    giveLike,
    comment,
    subComment,
}