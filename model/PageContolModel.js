const mongoose = require("mongoose");

const pageControl = mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  faviconURL: {
    type: String,
    required: true,
  },
});

// export model user with UserSchema
module.exports = mongoose.model("pageControl", pageControl);
