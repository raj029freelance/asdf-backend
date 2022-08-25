const mongoose = require("mongoose");

const SearchSchema = mongoose.Schema({
  organization_id: {
    type: String,
    required: true,
    unique: true,
  },
  organization_name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// export model user with UserSchema
module.exports = mongoose.model("search", SearchSchema);
