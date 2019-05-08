const Router = require('koa-router');
const router = new Router();
const tag_controller = require('../controllers/tag_controller');
const category_controller = require('../controllers/category_controller');

router.post('/tag/getTagList', tag_controller.getTagList);
router.post('/category/getCategoryList', category_controller.getCategoryList);


module.exports = router;