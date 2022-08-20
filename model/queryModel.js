const mongoose = require("mongoose");

const QuerySchema = mongoose.Schema({
  description : {
      type : String,
      required : true,
  },
  email : {
      type :String,
      required : true
  },
  name : {
    type :String,
    required : true
  },
  phoneNumber : {
    type : String,
    required : true
  },
  resolved: {
    type: Boolean,
    default : false
  }
});

// export model user with UserSchema
module.exports = mongoose.model("Query", QuerySchema);
