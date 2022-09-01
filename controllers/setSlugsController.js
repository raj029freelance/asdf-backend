const {
  setSlugsIfUndefined: faqSlugSetter,
} = require("../controllers/faqController");
const {
  setSlugsIfUndefined: orgSlugSetter,
} = require("../controllers/organizationController");
const {
  setSlugsIfUndefined: searchSlugSetter,
} = require("../controllers/searchController");

exports.setSlugs = async (req, res) => {
  try {
    await orgSlugSetter();
    await faqSlugSetter();
    await searchSlugSetter();
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
};
