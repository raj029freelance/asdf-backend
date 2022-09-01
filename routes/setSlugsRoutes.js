const express = require("express");
const { setSlugs } = require("../controllers/setSlugsController");
const router = express.Router();

router.route("/").post(setSlugs);

module.exports = router;
