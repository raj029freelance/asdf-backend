const Analytics = require("../model/analyticsModel");
const axios = require("axios");

exports.addSearchTerm = async (req, res) => {
  try {
    const { monthAndYear, searchData } = req.body;

    // Check if the month already exists
    const doesExists = await Analytics.find({ monthAndYear });
    if (doesExists.length > 0) {
      await Analytics.updateOne(
        { monthAndYear },
        { $push: { searchedTerms: searchData } }
      );
      res.status(200).json({
        status: "success",
        message: "Month analytics updated",
      });
    } else {
      const addData = new Analytics({
        monthAndYear,
        searchedTerms: [searchData],
      });
      await addData.save();
      res.status(200).json({
        status: "success",
        message: "new entry created",
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { monthAndYear } = req.params;

    const results = await Analytics.findOne({ monthAndYear });

    if (results !== null && results !== undefined) {
      // get top searched results
      var topTermsCounter = {};
      for (var i = 0; i < results.searchedTerms.length; i++) {
        var term = results.searchedTerms[i].term;
        if (topTermsCounter[term] === undefined) {
          topTermsCounter[term] = {
            count: 1,
            term: term,
            data: results.searchedTerms[i],
          };
        } else {
          topTermsCounter[term].count += 1;
        }
      }
      //   console.log(topTermsCounter);
      // get terms with zero results
      var zeroTermsCounter = {};
      for (var i = 0; i < results.searchedTerms.length; i++) {
        var term = results.searchedTerms[i].term;
        // console.log(term);
        if (
          zeroTermsCounter[term] === undefined &&
          results.searchedTerms[i].resultsCount === 0
        ) {
          zeroTermsCounter[term] = {
            count: 1,
            term: term,
            data: results.searchedTerms[i],
          };
        } else if (
          zeroTermsCounter[term] !== undefined &&
          results.searchedTerms[i].resultsCount === 0
        ) {
          zeroTermsCounter[term].count += 1;
        }
      }

      var newZeroTerms = [];
      var newTopTerms = [];

      Object.keys(topTermsCounter).forEach(function (key) {
        newTopTerms.push(topTermsCounter[key]);
      });
      Object.keys(zeroTermsCounter).forEach(function (key) {
        newZeroTerms.push(zeroTermsCounter[key]);
      });

      newZeroTerms = newZeroTerms.sort((a, b) => (a.count < b.count ? 1 : -1));
      newTopTerms = newTopTerms.sort((a, b) => (a.count < b.count ? 1 : -1));

      //   console.log(zeroTermsCounter);
      res.status(200).json({
        zeroTerms: newZeroTerms,
        topTerms: newTopTerms,
      });
    } else {
      res.status(200).json({
        status: "success",
        analytics: {},
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
