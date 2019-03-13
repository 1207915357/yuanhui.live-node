const Router = require('koa-router');
const router = new Router();
const tag_controller = require('../controllers/tag_controller');

router.post('/tag/getTagList', tag_controller.getTagList);



module.exports = router;