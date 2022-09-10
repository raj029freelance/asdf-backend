const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.route("/addSearchTerm").post(analyticsController.addSearchTerm);
router.route("/get/:monthAndYear").get(analyticsController.getAnalytics);
module.exports = router;
