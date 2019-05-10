// const config = require('../config');
const User_col = require('../model/user');
const uuidV1 = require('uuid/v1')
const passport = require('../utils/passport')

const get = async (ctx, next) => {
  ctx.status = 200;
  ctx.body = {
    msg: 'get request!!',
    data: {
      data: ctx.request.query,
    }
  }
}

const post = async (ctx, next) => {
  ctx.status = 200;
  ctx.body = {
    msg: 'post request!!',
    data: {
      data: ctx.request.body
    }
  }
}

// 登录
const login = async (ctx, next) => {
  const req = ctx.request.body;
  // 获取用户的 userId
  const user = await User_col.findOne({
    userName: req.userName
  });
  if (!user) {
    ctx.status = 200;
    ctx.body = {
      code: 300,
      msg: 'User does not exist!'
    }
    return;
  }

  const password = user.password;
  ctx.status = 200;
  if (password === passport.cryptoPwd(req.password)) {
    const resData = {
         userId: user.userId,
        //  userName: user.userName,
        //  likeArticle: user.likeArticle
    }
    ctx.body = {
      code: 1,
      msg: 'login success',
      data: {
          token: passport.getToken(resData) 
      }
    }
    return;
  }

  ctx.body = {
    code: 301,
    msg: 'account or password error!'
  }
}

//获取用户信息 
const getUserInfo = async(ctx,nest) =>{
  const token = ctx.headers.authorization
  const payload = passport.getJWTPayload(token)
  if (!payload) {
    console.log('token error (getUserInfo)!')
    ctx.status = 403
    return
  }
  const userInfo = await User_col.findOne(
    {userId:payload.userId},
    { //不返回字段
      password: 0,
      __v: 0,
      _id: 0,
    }
  )
  userInfo.commentNotice.reverse()
  if(userInfo){
    ctx.body = {
      msg:'success',
      code: 1,
      data: userInfo 
    }
  }else{
    ctx.body = {
      msg: 'failed',
      code: 0,
    }
  }
}

// 注册
const register = async (ctx, next) => {
  const req = ctx.request.body;
  // 获取用户的 userId
  const user = await User_col.findOne({
    userName: req.userName
  });

  ctx.status = 200;
  if (user) {
    ctx.body = {
      code: 300,
      msg: '用户名重复！'
    }
    return;
  }
  try{
  const allUser = await User_col.find()
  const userNum = allUser.length
  // 插入新用户
  const userId = uuidV1();
  const newUser = await User_col.create({
    userId,
    userName: req.userName,
    password: passport.cryptoPwd(req.password), //密码加盐加密
    unreadNum: 1,
    commentNotice:[
      {
        type:'notice',
        content: `欢迎访问博客(yuanhui.live)，你是本站的第${userNum+1}位用户!`,
        user:{
          userName:'yh',
          type: 0
        },
        toUser:{
          userName:req.userName,
          userId
        }

      }
    ]
  });

  if (newUser) {
      ctx.body = {
        code: 1,
        msg: '注册成功！',
        data: {
          userId: newUser.userId,
          userName: newUser.userName
        }
      };
  } else {
    ctx.body = {
      code: 0,
      msg: '注册失败！'
    };
  }
  } catch (e) {
    console.log(e, 'err')
  }
}

const getAllUser = async(ctx,next)=>{
  const userList = await User_col.find()
  if (userList){
    ctx.body = {
      code: 1,
      data:userList,
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
  get,
  post,
  login,
  register,
  getUserInfo,
  getAllUser
}