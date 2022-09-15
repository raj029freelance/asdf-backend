const Search = require("../model/searchModel");
const Organization = require("../model/organizationModal");
const slugify = require("slugify");

exports.setSlugsIfUndefined = async() => {
    try {
        const recents = await Search.find();
        recents.forEach(async(recent) => {
            if (recent.slug) return;
            const { CompanyName, PhoneNumber } = await Organization.findById(
                recent.organization_id
            );
            await Search.updateOne({ _id: recent._id }, {
                $set: {
                    slug: slugify(`${CompanyName.toLowerCase()} ${PhoneNumber}`),
                },
            });
        });
        console.log("Slugs created for all search");
    } catch {
        console.log("Slugs not created for all search");
    }
};

exports.getAllSearches = async(req, res) => {
    try {
        const searches = await Search.find({}).sort({ _id: -1 });
        res.status(200).json({
            result: searches.length,
            searches: searches,
        });
    } catch (err) {
        res.status(400).json({
            status: 404,
            message: err,
        });
    }
};

exports.addRecentSearch = async(req, res) => {
    try {
        const { organization_id, organization_name, organization_number, slug } =
        req.body;
        if (!(organization_id && organization_name)) {
            return res.status(400).json({
                message: "organization id or name must be missing",
            });
        }

        const doesExists = await Search.find({ organization_id: organization_id });
        if (doesExists.length > 0) {
            return res.status(200).json({
                status: "success",
                message: "Already exists, ignoring...",
            });
        }
        const docCount = await Search.countDocuments({}).exec();
        const search = new Search({
            organization_id,
            organization_name,
            organization_number,
            slug,
        });
        if (docCount === 10) {
            await Search.findOneAndDelete({}, { sort: { organization_id: -1 } });
        }
        const newSearch = await search.save();
        res.status(200).json({
            status: "successfull",
            search: newSearch,
        });
    } catch (err) {
        res.status(400).json({
            message: err,
        });
    }
};