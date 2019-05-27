const Router = require('koa-router');
const router = new Router();
const comment_controller = require('../controllers/comment_controller');

//评论
router.post('/comment/comment', comment_controller.comment);
router.post('/comment/subComment', comment_controller.subComment);
router.post('/comment/getCommentList', comment_controller.getCommentList);
router.post('/comment/checkComment', comment_controller.checkComment);

module.exports = router;