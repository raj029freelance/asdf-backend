const mongoose = require("mongoose");

const deviceToken = mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("deviceTokens", deviceToken);
