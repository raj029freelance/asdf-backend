const Faq = require("../model/faqModel");

exports.getAllFaq = async (req, res) => {
  try {
    const faqs = await Faq.find({});
    res.status(200).json({
      result: faqs.length,
      data: faqs,
    });
  } catch (err) {
    res.status(400).json({
      status: 404,
      message: err,
    });
  }
};

exports.getFaqById = async (req, res) => {
  try {
    const faqs = await Faq.find({ _id: req.params.id });
    res.status(200).json({
      data: faqs,
    });
  } catch (err) {
    res.status(400).json({
      status: 404,
      message: err,
    });
  }
};

exports.createFaq = async (req, res) => {
  try {
    const faq = new Faq(req.body);
    const savedFaq = await faq.save();
    res.status(200).json({
      data: savedFaq,
    });
  } catch (err) {
    res.status(400).json({
      status: 404,
      message: err,
    });
  }
};

exports.editFaq = async (req, res) => {
  try {
    const updatedFaq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        query: updatedFaq,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const updatedFaq = await Faq.findByIdAndDelete(req.params.id).sort({
      _id: -1,
    });
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
