const express = require("express");
const router = express.Router();
const deviceTokenController = require("../controllers/deviceTokenController");

router.route("/").post(deviceTokenController.addToken);
module.exports = router;
