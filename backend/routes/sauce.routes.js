const router = require("express").Router();
const sauceController = require("../controllers/sauce.controller");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/", multer, sauceController.create);

router.get("/", auth, sauceController.list);
router.get("/:id", auth, sauceController.listOne);
router.delete("/:id", auth, sauceController.delete);
router.put("/:id", multer, auth, sauceController.update);
router.post("/:id/like", auth, sauceController.like);
module.exports = router;
