const Router = require('koa-router');
const router = new Router();
const article_controller = require('../controllers/article_controller');


const multer = require('koa-multer')
const path = require('path')
var storage = multer.diskStorage({
    //文件保存路径
    destination: function (req, file, cb) {
        cb(null, 'public/imgs/') //path.resolve('public/phoneManageSystem')
    },
    //修改文件名称
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split("."); //以点分割成数组，数组的最后一项就是后缀名
        cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }

})
//加载配置
var upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 / 2 // 限制512KB
    }
});


router.post('/article/publish', article_controller.publish);
router.post('/article/articleList', article_controller.articleList);
router.post('/article/searchArticle', article_controller.searchArticle);
router.post('/article/updateArticle', article_controller.updateArticle);
router.post('/article/deleteArticle', article_controller.deleteArticle);
router.post('/article/articleDel', article_controller.articleDel);
router.post('/article/uploadCover', upload.single('file'), article_controller.uploadCover);
router.post('/article/markdownImg', upload.single('file'), article_controller.markdownImg);
router.post('/article/articleDraft', article_controller.articleDraft);
//点赞
router.post('/article/giveLike', article_controller.giveLike);
//评论
router.post('/article/comment', article_controller.comment);
router.post('/article/subComment', article_controller.subComment);
router.post('/article/getCommentList', article_controller.getCommentList);


module.exports = router;