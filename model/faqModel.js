const mongoose = require("mongoose");
const faqSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    createdAt: {
        type: String,
        required: true,
    },
});

const faq = mongoose.model("blog", faqSchema);
module.exports = faq;