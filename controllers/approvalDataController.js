const ApprovalData = require("../model/approvalData");
const Organization = require("../model/organizationModal");
const slugify = require("slugify");

exports.getAllData = async (req, res) => {
  try {
    const approvals = await ApprovalData.find({}).sort({ _id: -1 });
    res.status(200).json({
      result: approvals.length,
      data: approvals,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err,
    });
  }
};

function isANumber(str) {
  return !/\D/.test(str);
}

exports.addData = async (req, res) => {
  try {
    const { PhoneNumber } = req.body;
    var containsDigits = isANumber(PhoneNumber);
    if (PhoneNumber.length !== 10 || !containsDigits) {
      res.status(422).json({
        status: "fail",
        message: "Invalid PhoneNumber",
      });
      return;
    }

    await ApprovalData.create({
      ...req.body,
    });

    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.approveSubmission = async (req, res) => {
  try {
    const organization = await Organization.create({
      ...req.body.data,
      slug: slugify(
        `${req.body.data.CompanyName.toLowerCase()} ${
          req.body.data.PhoneNumber
        }`
      ),
    });

    const submission = await ApprovalData.findByIdAndUpdate(
      req.body.id,
      {
        approved: true,
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        organization,
        submission,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteApproveData = async (req, res) => {
  try {
    await ApprovalData.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        mesage: "Deleted",
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
