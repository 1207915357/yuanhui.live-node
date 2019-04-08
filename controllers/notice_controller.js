const Article_col = require('../model/article');
const User_col = require('../model/user');

//通知全体(除自己)
const noticeAllUser = async (ctx, nest) => {
    const {
        // type, 
        userId,
        content,
        articleId,
    } = ctx.request.body
    if (!userId || !content || !articleId) {
        ctx.body = {
            code: 0,
            msg: '缺少必要参数！'
        }
        return
    }
    const userInfo = await User_col.findOne({
        userId: userId
    })
    // const articleInfo = await Article_col.findOne({
    //     articleId
    // })
    let noticeObj = {
        type:'notice',
        user: {
            userId: userInfo.userId,
            userName: userInfo.userName
        },
        content,
        articleId,
        // articleTitle: articleInfo.title,
    }

    const allUser = await User_col.find({userId:{$ne:userId}})

    for(let ele of allUser){
        let commentNotice = ele.commentNotice
        let unreadNum = ele.unreadNum
        unreadNum++
        commentNotice.push(noticeObj)
        // ?? 循环更新全部写法
        await User_col.updateOne({   
             userId: ele.userId
         }, {
             commentNotice,
             unreadNum,
         })
    }

    ctx.body = {
        code: 1,
        msg: 'success',
        data: null
    }

    // if (updateUserInfo) {
    //     ctx.body = {
    //         code: 1,
    //         msg: 'success',
    //         data: null
    //     }
    // } else {
    //     ctx.body = {
    //         code: 0,
    //         msg: 'failed',
    //     }
    // }
}

//通知用户消息
const publishNotice = async (ctx, nest) => {
    const {
        type,  // comment || answer || notice
        userId,
        toUserId,
        content,
        toContent,
        articleId,
    } = ctx.request.body
     if (!type || !userId || !toUserId || !content || !articleId) {
         ctx.body = {
             code: 0,
             msg: '缺少必要参数！'
         }
         return
     }
     const userInfo = await User_col.findOne({
         userId: userId
     })
     const toUserInfo = await User_col.findOne({
         userId: toUserId
     })
     const articleInfo = await Article_col.findOne({
         articleId
     })
     let noticeObj = {
         type,
         user: {
             userId: userInfo.userId,
             userName: userInfo.userName
         },
         toUser: {
             userId: toUserInfo.userId,
             userName: toUserInfo.userName
         },
         content,
         toContent, 
         articleId,
         articleTitle: articleInfo.title,
     }
     let commentNotice = toUserInfo.commentNotice
     let unreadNum = toUserInfo.unreadNum
    commentNotice.push(noticeObj)
    unreadNum++
     let updateUserInfo = await User_col.updateOne({
         userId: toUserId
     }, {
         commentNotice,
         unreadNum,
     })

     if (updateUserInfo){
         ctx.body = {
             code: 1,
             msg:'success',
             data:null
         }
     }else{
          ctx.body = {
              code: 0,
              msg: 'failed',
          }
     }
}

//获取通知消息
const getNotice = async (ctx, nest) => {
    const userId = ctx.request.body.userId
    const user = await User_col.findOne({
        userId
    })
    if (user) {
        ctx.body = {
            code: 1,
            msg: 'success',
            data: {
                commentNotice: user.commentNotice.reverse(),
                unreadNum: user.unreadNum,
            }
        }
    } else {
        console.log(user, 'error')
        ctx.body = {
            code: 0,
            msg: 'failed',
        }

    }
}

//已读通知消息
const readedNotice = async (ctx, nest) => {
    const userId = ctx.request.body.userId
    const user = await User_col.updateOne({
        userId
    }, {
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
             code: 0,
             msg: 'failed',
         }
    }
}

//清除通知消息
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
            code: 0,
            msg: 'failed',
        }
    }
}

module.exports = {
     publishNotice,
     noticeAllUser,
     getNotice,
     readedNotice,
     clearNotice
}