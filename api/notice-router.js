const Router = require('koa-router');
const router = new Router();
const notice_controller = require('../controllers/notice_controller');

router.post('/notice/publishNotice', notice_controller.publishNotice);
router.post('/notice/noticeAllUser', notice_controller.noticeAllUser);
router.post('/notice/getNotice', notice_controller.getNotice);
router.post('/notice/readedNotice', notice_controller.readedNotice);
router.post('/notice/clearNotice', notice_controller.clearNotice);

module.exports = router;