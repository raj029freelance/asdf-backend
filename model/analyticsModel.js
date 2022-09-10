const mongoose = require("mongoose");

const analytics = mongoose.Schema({
  monthAndYear: {
    type: String,
    required: true,
  },
  searchedTerms: {
    type: [],
    default: [],
  },
});

// export model user with UserSchema
module.exports = mongoose.model("analytics", analytics);
