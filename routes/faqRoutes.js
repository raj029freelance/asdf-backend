const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");

router.route("/").get(faqController.getAllFaq);
router.route("/create").post(faqController.createFaq);
router.route("/edit/:id").post(faqController.editFaq);
router.route("/delete/:id").post(faqController.deleteFaq);
router.route("/:slug").get(faqController.getFaqBySlug);
router.route("/id/:id").get(faqController.getFaqById);

module.exports = router;
