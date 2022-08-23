const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageControlController");

router.route("/").get(pageController.getPageData);
router.route("/create").post(pageController.createPageData);
router.route("/edit").post(pageController.editPageData);

module.exports = router;
