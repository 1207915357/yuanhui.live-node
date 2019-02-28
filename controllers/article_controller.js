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
const uuidV1 = require('uuid/v1')


//文章操作--------------------------------------------------------------
//发布文章
const publish = async (ctx, next) => {
    const req = ctx.request.body
    const id = uuidV1();
    const newArticle = await Article_col.create({
        id,
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
    const article = await Article_col.findOneAndUpdate(
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
             newArticle = await ArticleDraft_col.findOneAndUpdate(
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

    var user = await User_col.findOne({userId})
    var article = await Article_col.findOne({id:articleId})
    // var {user, article} = await Promise.all(
    //     User_col.findOne({id: userId}),
    //     Article_col.findOne({id: articleId})
    // )
    if(user){
        let index =  user.likeArticle.findIndex((val)=>{return val===articleId})
        let likeArticle=[],like=""
        if(index === -1){
            likeArticle = user.likeArticle
            like = article.like+1
            likeArticle.push(articleId)
        }else{
            likeArticle = user.likeArticle
            like = article.like - 1
            likeArticle.splice(index, 1)
        }
        await User_col.findOneAndUpdate({
              userId
          }, {
              likeArticle
          })
        await Article_col.findOneAndUpdate({
              id: articleId
          }, {
              like
          })
          ctx.body = {
              code: 1,
              msg: 'success!',
              data: null
          }
       
    }else{
        ctx.body = {
            code: 0,
            msg: 'failed!',
        }
    }
}







// 收藏
const collectCourse = async (ctx, next) => {
    const req = ctx.request.body;
    const userId = req.userId;
    const courseId = req.courseId;

    if (!userId || !courseId) {
        ctx.status = 200;
        ctx.body = {
            code: 0,
            msg: '收藏成功！'
        }
        return;
    }

    const result = await User_col.findOne({
        userId
    }, {
        collections: 1,
        _id: 0
    });

    const collections = result.collections;

    ctx.status = 200;
    if (collections.includes(courseId)) {
        ctx.body = {
            code: 1,
            msg: '已收藏该课程！'
        }
        return;
    }

    collections.push(courseId);

    await User_col.update({
        userId: req.userId
    }, {
        $set: {
            collections,
        }
    });

    ctx.body = {
        code: 1,
        msg: '收藏成功！'
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
}