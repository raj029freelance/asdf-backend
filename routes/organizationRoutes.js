const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");

router
  .route("/")
  .get(organizationController.getAllOrganization)
  .post(organizationController.createOrganization);
router
  .route("/paginated/all")
  .get(organizationController.getPaginatedOrganization);
router.route("/all").post(organizationController.insertAllOrganizations);
router
  .route("/query")
  .get(organizationController.getAllQueries)
  .post(organizationController.postQuery);
router.route("/query/:id").delete(organizationController.deleteQuery);
router.route("/query/edit/:id").post(organizationController.updateQuery);
router
  .route("/:slug")
  .get(organizationController.getOrganization)
  .post(organizationController.updateOrganization)
  .delete(organizationController.deleteOrganization);
module.exports = router;
