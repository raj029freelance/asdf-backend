const Organization = require("../model/organizationModal");
const QueryModel = require("../model/queryModel");
const slugify = require("slugify");
const util = require("util");
const getBaseUrl = require("../supporters/endpoints");
const scrape = require("../supporters/externalAPI");
const axios = require("axios");
const reqPromise = require("request-promise");

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

        const regexExpression = new RegExp(["^", CompanyName, "$"].join(""), "i");
        const regexArr = [regexExpression]
        CompanyName.split(" ").forEach((word)=>{
            if(word.length<3)return;
            const regex=new RegExp(["^", word, "$"].join(""), "i");
            regexArr.push(regex)
        })

        const searchResults = await Organization.find({
            $or:regexArr
        });
        return searchResults;
    } catch {
        return [];
    }
};

const getResultsFromGoogle = async(CompanyName, res) => {
    try {
        const resData = await reqPromise({
            url: `https://www.google.co.in/search?q=${CompanyName}+customer+care+number&gl=in&lum_json=1&hl=en`,
            proxy: "http://lum-customer-hl_55d2f349-zone-serp:jjp3557px8vg@zproxy.lum-superproxy.io:22225",
            rejectUnauthorized: false,
        });

        var data = {};

        const knowledgeGraphApiRes = JSON.parse(resData);

        // console.log(knowledgeGraphApiRes);
        // console.log(knowledgeGraphApiRes);
        // console.log(Object.keys(knowledgeGraphApiRes));
        const results = {
            answerBox: {},
            knowledgeBox: {},
        };
        // console.log("dec");
        // check answer box
        if (
            knowledgeGraphApiRes.featured_snippets !== undefined &&
            knowledgeGraphApiRes.featured_snippets !== null
        ) {
            // console.log("hiy");
            results.answerBox.phoneNumber =
                knowledgeGraphApiRes.featured_snippets[0].title;
            results.answerBox.link = knowledgeGraphApiRes.featured_snippets[0].link;
            results.answerBox.title =
                knowledgeGraphApiRes.featured_snippets[0].link_title;
            results.answerBox.description = CompanyName + " Customer Care Number";
            // console.log("end hit");
        }

        if (
            knowledgeGraphApiRes.knowledge !== undefined &&
            knowledgeGraphApiRes.knowledge !== null
        ) {
            // console.log("dgdg");

            results.knowledgeBox.title = knowledgeGraphApiRes.knowledge.name;
            results.knowledgeBox.description =
                knowledgeGraphApiRes.knowledge.description;
            results.knowledgeBox.type = "-";
            results.knowledgeBox.phoneNumber = knowledgeGraphApiRes.knowledge.phone;
            results.knowledgeBox.link = knowledgeGraphApiRes.organic[0].link;

            // Get company type
            for (let i = 0; i < knowledgeGraphApiRes.knowledge.facts.length; i++) {
                if (
                    knowledgeGraphApiRes.knowledge.facts[i].key === "Type of business"
                ) {
                    results.knowledgeBox.type =
                        knowledgeGraphApiRes.knowledge.facts[i].value[0].text;
                }
            }
        }
        // console.log(knowledgeGraphApiRes.knowledge);
        // console.log(results);

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
        console.log("Final Data", data);
        // insert to db

        if (data.PhoneNumber !== undefined && data.PhoneNumber !== undefined) {
            const newSlug = slugify(
                `${data.CompanyName.toLowerCase()} ${data.PhoneNumber}`
            );

            const doesExists = await Organization.findOne({ slug: newSlug });
            if (doesExists) {
                return doesExists;
            }

            const addNewOrg = new Organization({
                ...data,
                slug: newSlug,
            });
            const savedOrg = await addNewOrg.save();
            return [savedOrg];
        } else {
            return [];
        }
    } catch (err) {
        console.log("error", err);
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

const sendAutoCompleteResults = (CompanyName, orgsList, res) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    axios.post(`${getBaseUrl()}/api/analytics/addSearchTerm`, {
        monthAndYear: `${currentMonth}-${currentYear}`,
        searchData: {
            term: CompanyName,
            resultsCount: orgsList.length,
        },
    });

    return res.status(200).json({
        results: orgsList.length,
        data: {
            organizations: orgsList,
        },
    });
};

exports.getAllOrganization = async(req, res) => {
    const CompanyName = req.query.name.toLowerCase();

    if(!CompanyName || CompanyName.trim().length==0) return sendAutoCompleteResults(CompanyName,[], res);

    const skipExternalFetch = req.query.external;
    const exactMatchResults = await getExactSearch(CompanyName);
    if (exactMatchResults.length > 0) {
        return sendAutoCompleteResults(CompanyName, exactMatchResults, res);
    }

    if (!skipExternalFetch) {
        console.log("Calling google API");
        const resultsFromGoogle = await getResultsFromGoogle(CompanyName, res);
        if (resultsFromGoogle.length > 0) {
            return sendAutoCompleteResults(CompanyName, resultsFromGoogle, res);
        }
    }

    console.log("Calling fuzzy");
    const fuzzyResults = await getFuzzyResults(CompanyName);
    if (fuzzyResults.length > 0) {
        return sendAutoCompleteResults(CompanyName, fuzzyResults, res);
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    axios.post(`${getBaseUrl()}/api/analytics/addSearchTerm`, {
        monthAndYear: `${currentMonth}-${currentYear}`,
        searchData: {
            term: CompanyName,
            resultsCount: 0,
        },
    });
    return sendAutoCompleteResults(CompanyName,[], res);
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

        const doesExists = await Organization.find({
            $or: [
                { slug: newSlug },
                { CompanyName: req.body.CompanyName },
                { PhoneNumber: req.body.PhoneNumber },
            ],
        });

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
