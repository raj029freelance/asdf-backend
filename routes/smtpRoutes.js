const express = require("express");
const { contactUs } = require("../controllers/smtpController");

const router = express.Router();

router.route("/us").post(contactUs);

module.exports = router;
