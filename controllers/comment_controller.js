/*
 * @Author: yuanhui 
 * @Email: 1207915357@qq.com
 * @Date: 2018-12-16 19:08:12 
 * @Last Modified by: yuanhui
 * @Last Modified time: 
 * @Description: comment controller 
 */


const Article_col = require('../model/article');
const User_col = require('../model/user');
const Comment_col = require('../model/comments.js');
const uuidV1 = require('uuid/v1')
const passport = require('../utils/passport')

//评论操作--------------------------------------------------------------

//文章评论
const comment = async (ctx, nest) => {
    const payload = passport.getJWTPayload(ctx.headers.authorization)
    if (!payload) {
        console.log('token error （comment）!')
        ctx.status = 403
        return
    }
    const {
        userId,
        articleId,
        articleTitle,
        content,
    } = ctx.request.body
    if (!userId || !articleId || !content || !articleTitle) {
        ctx.status = 400
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
        const commentId = uuidV1();
        let theUser = {
            userId: user.userId,
            userName: user.userName,
            type: user.type
        }
        await Comment_col.create({
            commentId,
            articleId,
            articleTitle,
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
            $inc: {
                comments: 1
            }
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
            userId: toUserId
        })
        let theUser = {
            userId: user.userId,
            userName: user.userName,
            type: user.type
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
        sub_comment.push({
            commentId,
            articleId,
            user: theUser,
            toUser: theToUser,
            content,
        })
        await Comment_col.updateOne({
            commentId
        }, {
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
            $inc: {
                comments: 1
            }
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

//后台获取评论列表
const getCommentList = async (ctx, next) => {
    //token认证
    const {
        row,
        start,
        articleId
    } = ctx.request.body;
    let commentList,AllList
    if(articleId){
         commentList = await Comment_col.find({
                 articleId
             })
             .skip(+start) // 转化成number
             .limit(+row)
             .sort({
                 '_id': -1
             })
         AllList = await Comment_col.find({articleId})

    }else{
         commentList = await Comment_col.find()
            .skip(+start) // 转化成number
            .limit(+row)
            .sort({
                '_id': -1
            })
         AllList = await Comment_col.find()

    }

    
    if (commentList) {
        ctx.body = {
            code: 1,
            msg: 'success',
            data: commentList,
            total:AllList.length
        }
    }
}

//审核评论
const checkComment = async (ctx, next) => {
    const {
        status,
        commentId,
        type,
        id,
        articleId
    } = ctx.request.body

    let updateComment
    if(type=="parent"){
        updateComment = await Comment_col.updateOne(
            {commentId},
            {status}
        )
    }else if(type=="children"){
         const result_comment = await Comment_col.findOne({
             commentId
         })
         let sub_comment = result_comment.sub_comment
         for (let ele of sub_comment){
             if(ele._id == id){
                 ele.status = status
             }
         }
         updateComment = await Comment_col.updateOne({
             commentId
         }, {
             sub_comment
         })
    }

    // ???待优化  更新文章的评论列表
      const commentList = await Comment_col.find({
          articleId
      }).sort({
          '_id': -1
      })
      const article = await Article_col.updateOne({
          articleId
      }, {
          commentList,
      })

    if(updateComment){
          ctx.body = {
              code: 1,
              msg: 'success',
              data: null
          }
    }else{
        ctx.body = {
            code: 0,
            msg: 'failed'
        }
    }
}



module.exports = {
    comment,
    subComment,
    getCommentList,
    checkComment
}