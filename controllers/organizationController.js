const Organization = require("../model/organizationModal");
const QueryModel = require("../model/queryModel");
const slugify = require("slugify");

const setSlugsIfUndefined = async () => {
  const orgs = await Organization.find({});
  orgs.forEach(async ({ _id, slug, CompanyName, PhoneNumber }) => {
    if (slug) return;
    await Organization.updateOne(
      { _id },
      { $set: { slug: slugify(`${CompanyName.toLowerCase()} ${PhoneNumber}`) } }
    );
  });
};

setSlugsIfUndefined();

exports.getAllOrganization = async (req, res) => {
  try {
    const CompanyName = req.query?.name;
    const words = CompanyName.split(" ");
    const queryList = [];
    if (words.length != 0) {
      words.forEach((word) => {
        queryList.push({ CompanyName: { $regex: new RegExp(word, "i") } });
      });
    }

    var condition = CompanyName ? { $or: queryList } : {};
    const organizations = await Organization.find(condition);
    res.status(200).json({
      status: "success",
      results: organizations.length,
      data: {
        organizations,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 404,
      message: err,
    });
  }
};

exports.getPaginatedOrganization = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const organizations = await Organization.paginate(
      {},
      { page: Number(page), limit: Number(limit) }
    );
    res.status(200).json({
      status: "success",
      results: organizations.length,
      data: {
        organizations,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 404,
      message: "Api failed",
    });
  }
};

exports.getOrganization = async (req, res) => {
  const { slug } = req.params;
  try {
    const organization = await Organization.findOne({ slug });
    res.status(200).json({
      status: "success",
      data: {
        organization,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
exports.createOrganization = async (req, res) => {
  try {
    const newOrganization = await Organization.create({
      ...req.body,
      slug: slugify(
        `${req.body.CompanyName.toLowerCase()} ${req.body.PhoneNumber}`
      ),
    });

    res.status(201).json({
      status: "success",
      data: {
        organization: newOrganization,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.insertAllOrganizations = async (req, res) => {
  try {
    await Organization.insertMany(req.body, { ordered: true });
    res.status(201).json({
      status: "success",
      data: {
        message: "Sucessfully inserted columns",
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const updatedOrganization = await Organization.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json({
      status: "success",
      data: {
        organization: updatedOrganization,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    await Organization.findOneAndDelete({ slug: req.params.slug });
    res.status(200).json({
      status: "Successfully Delete",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "Failed To Delete Document",
      message: err,
    });
  }
};

exports.getAllQueries = async (req, res) => {
  try {
    const queries = await QueryModel.find({}).sort({ _id: -1 });
    res.status(200).json({
      status: "success",
      results: queries.length,
      queries,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.postQuery = async (req, res) => {
  try {
    const Query = await QueryModel.create(req.body);
    res.status(200).json({
      status: "success",
      message: "Query successfully posted",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateQuery = async (req, res) => {
  try {
    const updatedQuery = await QueryModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json({
      status: "success",
      data: {
        query: updatedQuery,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteQuery = async (req, res) => {
  try {
    await QueryModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "Successfully Delete",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "Failed To Delete Query",
      message: err,
    });
  }
};
