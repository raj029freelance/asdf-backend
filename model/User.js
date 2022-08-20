const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role : {
    type : String,
    enum : ["admin" , "moderator"],
    default : "moderator"
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// export model user with UserSchema
module.exports = mongoose.model("user", UserSchema);
