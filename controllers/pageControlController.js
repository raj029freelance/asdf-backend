const PageControlModel = require("../model/PageContolModel.js");

exports.getPageData = async (req, res) => {
  try {
    var pageData = await PageControlModel.find({}).limit(1);
    if (pageData.length > 0) {
      pageData = pageData[0];
    }
    res.status(200).json({
      status: "success",
      results: pageData.length,
      data: {
        pageData,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 404,
      message: err,
    });
  }
};

exports.editPageData = async (req, res) => {
  try {
    const pageData = await PageControlModel.findByIdAndUpdate(
      req.body._id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json({
      status: "success",
      data: {
        pageData,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 404,
      message: err,
    });
  }
};

exports.createPageData = async (req, res) => {
  data = req.body;
  try {
    const pageData = new PageControlModel(data);
    const savedPageData = await pageData.save();
    res.status(200).json({
      status: "success",
      data: {
        savedPageData,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 404,
      message: err,
    });
  }
};
