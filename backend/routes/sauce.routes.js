const router = require('express').Router();
const sauceController = require('../controllers/sauce.controller');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post("/", multer, sauceController.create);

router.get("/", sauceController.list);
router.get("/:id", sauceController.listOne);
router.delete("/:id", sauceController.delete);
router.put("/:id", multer, sauceController.update);
router.post("/:id/like", sauceController.like);
module.exports = router;