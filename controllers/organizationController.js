const Organization = require("../model/organizationModal");
const QueryModel = require("../model/queryModel");
const slugify = require("slugify");
const util = require("util");
const getBaseUrl = require("../supporters/endpoints");
const scrape = require("../supporters/externalAPI");
const axios = require("axios");

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

exports.setSlugsIfUndefined = async() => {
    try {
        const orgs = await Organization.find({});
        orgs.forEach(async({ _id, slug, CompanyName, PhoneNumber }) => {
            if (slug) return;
            await Organization.updateOne({ _id }, {
                $set: {
                    slug: slugify(`${CompanyName.toLowerCase()} ${PhoneNumber}`),
                },
            });
        });
        console.log("Slugs created for all organizations");
    } catch {
        console.log("Slugs not created for all organizations");
    }
};

const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

exports.getExternalOrgs = async(req, res) => {
    try {
        const orgsList = await Organization.find({ external: "true" });
        res.status(200).json({
            status: "success",
            data: orgsList,
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            err: err,
        });
    }
};

const getExactSearch = async(CompanyName) => {
    try {
        var regexExpression = new RegExp(["^", CompanyName, "$"].join(""), "i");
        const searchResults = await Organization.find({
            CompanyName: regexExpression,
        });
        return searchResults;
    } catch {
        return [];
    }
};

const getResultsFromGoogle = async(CompanyName, res) => {
    try {
        const knowledgeGraphApi = await axios.get(
            `https://serpapi.com/search.json?engine=google&q=${CompanyName}+customer+care+number&api_key=${process.env.GOOGLE_API_KEY}`
        );
        const knowledgeGraphApiRes = knowledgeGraphApi.data;
        // console.log(knowledgeGraphApiRes);
        // console.log(knowledgeGraphApiRes);
        const results = {
            answerBox: {},
            knowledgeBox: {},
        };
        // console.log("dec");
        // check answer box
        if (
            knowledgeGraphApiRes.answer_box !== undefined &&
            knowledgeGraphApiRes.answer_box !== null
        ) {
            // console.log("hiy");
            results.answerBox.phoneNumber = knowledgeGraphApiRes.answer_box.answer;
            results.answerBox.link = knowledgeGraphApiRes.answer_box.link;
            results.answerBox.title = knowledgeGraphApiRes.answer_box.title;
            results.answerBox.description = knowledgeGraphApiRes.answer_box.snippet;
            // console.log("end hit");
        }
        if (
            knowledgeGraphApiRes.knowledge_graph !== undefined &&
            knowledgeGraphApiRes.knowledge_graph !== null
        ) {
            // console.log("dgdg");

            results.knowledgeBox.title = knowledgeGraphApiRes.knowledge_graph.title;
            results.knowledgeBox.description =
                knowledgeGraphApiRes.knowledge_graph.description;
            results.knowledgeBox.type = knowledgeGraphApiRes.knowledge_graph.type;
            results.knowledgeBox.phoneNumber =
                knowledgeGraphApiRes.knowledge_graph.customer_service;
            results.knowledgeBox.link =
                knowledgeGraphApiRes.knowledge_graph.customer_service_links !==
                undefined ?
                knowledgeGraphApiRes.knowledge_graph.customer_service_links[0].link :
                "";
        }
        if (
            results.knowledgeBox.phoneNumber !== undefined &&
            results.knowledgeBox.phoneNumber !== null
        ) {
            data = {
                PhoneNumber: results.knowledgeBox.phoneNumber,
                CompanyName: results.knowledgeBox.title,
                CompanyUrl: results.knowledgeBox.link,
                DepartmentYourCalling: "Customer Service",
                CallBackAvailable: "NO",
                CallPickedUpByARealPerson: "YES",
                description: results.knowledgeBox.description,
                CallCenterHours: "24 hours, 7 days",
                BestTimeToDail: "-",
                external: "true",
            };
        } else {
            data = {
                PhoneNumber: results.answerBox.phoneNumber,
                CompanyName: results.answerBox.title,
                CompanyUrl: results.answerBox.link,
                DepartmentYourCalling: "Customer Service",
                CallBackAvailable: "NO",
                CallPickedUpByARealPerson: "YES",
                description: results.answerBox.description,
                CallCenterHours: "24 hours, 7 days",
                BestTimeToDail: "-",
                external: "true",
            };
        }
        // insert to db

        if (data.PhoneNumber !== undefined && data.PhoneNumber !== undefined) {
            const newSlug = slugify(
                `${data.CompanyName.toLowerCase()} ${data.PhoneNumber}`
            );
            const addNewOrg = new Organization({
                ...data,
                slug: newSlug,
            });
            const savedOrg = await addNewOrg.save();
            return [savedOrg];
        } else {
            return [];
        }
    } catch {
        return [];
    }
};

const getFuzzyResults = async(CompanyName) => {
    try {
        const query = {
            index: "CompanyName",
            compound: {
                should: CompanyName.split(" ").map((word) => ({
                    text: {
                        query: word,
                        path: {
                            wildcard: "*",
                        },
                        fuzzy: {},
                    },
                })),
            },
        };

        var ans = await Organization.aggregate([{
            $search: query,
        }, ]);
        // console.log(ans);

        return ans;
    } catch {
        return [];
    }
};

const sendAutoCompleteResults = (orgsList, res) => {
    return res.status(200).json({
        results: orgsList.length,
        data: {
            organizations: orgsList,
        },
    });
};

exports.getAllOrganization = async(req, res) => {
    const CompanyName = req.query.name;
    const exactMatchResults = await getExactSearch(CompanyName);
    if (exactMatchResults.length > 0) {
        return sendAutoCompleteResults(exactMatchResults, res);
    }

    console.log("Calling google API");
    const resultsFromGoogle = await getResultsFromGoogle(CompanyName, res);
    if (resultsFromGoogle.length > 0) {
        return sendAutoCompleteResults(resultsFromGoogle, res);
    }

    console.log("Calling fuzzy");
    const fuzzyResults = await getFuzzyResults(CompanyName);
    if (fuzzyResults.length > 0) {
        return sendAutoCompleteResults(fuzzyResults, res);
    }
    return sendAutoCompleteResults([], res);
};

exports.getPaginatedOrganization = async(req, res) => {
    try {
        const { page, limit } = req.query;
        const organizations = await Organization.paginate({}, { page: Number(page), limit: Number(limit) });
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

exports.getOrganization = async(req, res) => {
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
exports.createOrganization = async(req, res) => {
    try {
        console.log(req.body);
        const newSlug = slugify(
            `${req.body.CompanyName.toLowerCase()} ${req.body.PhoneNumber}`
        );

        const doesExists = await Organization.find({ slug: newSlug });

        if (doesExists.length > 0) {
            return res.json({
                status: "fail",
                message: "Organization Already exists",
            });
        }

        const newOrganization = await Organization.create({
            ...req.body,
            slug: newSlug,
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

exports.insertAllOrganizations = async(req, res) => {
    try {
        const organizations = req.body;

        var subArray = [];
        var existsCheckQuery = { $or: subArray };
        for (var i = 0; i < organizations.length; i++) {
            const name = organizations[i].CompanyName ?
                organizations[i].CompanyName.trim() :
                "";

            if (name !== undefined && name !== null) {
                subArray.push({
                    CompanyName: name,
                });
            }
        }
        // console.log(existsCheckQuery);
        const doesExists = await Organization.find(existsCheckQuery);
        if (doesExists.length > 0) {
            res.status(400).json({
                status: "fail",
                message: "Duplicate entries.. The following data already exists in the database",
                orgs: doesExists,
            });
            return;
        }
        // console.log(doesExists);
        await Organization.insertMany(req.body, { ordered: true });
        res.status(201).json({
            status: "success",
            data: {
                message: "Sucessfully inserted columns",
            },
        });
    } catch (err) {
        console.log(err.stack);
        res.status(404).json({
            status: "fail",
            message: err,
        });
    }
};

exports.updateOrganization = async(req, res) => {
    try {
        const updatedOrganization = await Organization.findByIdAndUpdate(
            req.params.id,
            req.body, {
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

exports.deleteOrganization = async(req, res) => {
    try {
        await Organization.findByIdAndDelete(req.params.id);
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

exports.getAllQueries = async(req, res) => {
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

exports.postQuery = async(req, res) => {
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

exports.updateQuery = async(req, res) => {
    try {
        const updatedQuery = await QueryModel.findByIdAndUpdate(
            req.params.id,
            req.body, {
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

exports.deleteQuery = async(req, res) => {
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

exports.deleteAll = async(req, res) => {};