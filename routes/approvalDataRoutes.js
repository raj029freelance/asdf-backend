const express = require("express");
const router = express.Router();
const approvalController = require("../controllers/approvalDataController");

router
  .route("/")
  .get(approvalController.getAllData)
  .post(approvalController.addData);
router.route("/approve").post(approvalController.approveSubmission);
router.route("/delete/:id").post(approvalController.deleteApproveData);

module.exports = router;
