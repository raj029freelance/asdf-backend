const Faq = require("../model/faqModel");
const slugify = require("slugify");

exports.setSlugsIfUndefined = async() => {
    try {
        const faqs = await Faq.find({});
        faqs.forEach(async({ _id, slug, title }) => {
            if (slug) return;
            await Faq.updateOne({ _id }, { $set: { slug: slugify(title.toLowerCase()) } });
        });
        console.log("Slugs created for all faq");
    } catch {
        console.log("Slugs not created for all faq");
    }
};

exports.getAllFaq = async(req, res) => {
    try {
        const faqs = await Faq.find({}).sort({ _id: -1 });
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

exports.getFaqById = async(req, res) => {
    try {
        const { id } = req.params;
        const faq = await Faq.findById(id);
        res.status(200).json({
            data: faq,
        });
    } catch (err) {
        res.status(400).json({
            status: 404,
            message: err,
        });
    }
};

exports.getFaqBySlug = async(req, res) => {
    try {
        const faqs = await Faq.find({ slug: req.params.slug });
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

exports.createFaq = async(req, res) => {
    try {
        const faq = new Faq({
            ...req.body,
            slug: slugify(req.body.title),
            createdAt: new Date().toISOString(),
        });
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

exports.editFaq = async(req, res) => {
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

exports.deleteFaq = async(req, res) => {
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