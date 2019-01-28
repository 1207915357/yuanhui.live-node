const config = require('../config');
const User_col = require('../model/user');
const uuidV1 = require('uuid/v1')

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
    account: req.account
  }, {
    __v: 0,
    _id: 0
  });
  if (!user) {
    ctx.status = 200;
    ctx.body = {
      code: 0,
      msg: 'account or password error!'
    }
    return;
  }

  const userId = user.userId;

  // 获取数据库中的 hash
  const pass = await Passport_col.findOne({
    userId
  }, {
    hash: 1,
  });

  const match = await passport.validate(req.password, pass.hash);
  ctx.status = 200;
  if (match) {
    ctx.body = {
      code: 1,
      msg: 'login success',
      data: user
    }
    return;
  }

  ctx.body = {
    code: 0,
    msg: 'account or password error!'
  }
}

// 注册
const register = async (ctx, next) => {
  const req = ctx.request.body;
    console.log(req,'req')
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
  
  // 插入新用户
  const userId = uuidV1();
  console.log(userId,'id')
  const newUser = await User_col.create({
    userId,
    userName: req.userName,
    password: req.password
  });

  if (newUser) {
    // 加密
    // const hash = await passport.encrypt(req.password, config.saltTimes);
    // const result = await Passport_col.create({
    //   userId: userId,
    //   hash
    // })

    // if (result) {
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
}



module.exports = {
  get,
  post,
  login,
  register,
}