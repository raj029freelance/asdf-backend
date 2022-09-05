const mongoose = require("mongoose");
const approvalDataSchema = new mongoose.Schema({
  CompanyName: {
    type: String,
    required: [true, "Organization must have a name"],
  },
  CompanyUrl: {
    type: String,
  },
  PhoneNumber: {
    type: String,
    default: "",
  },
  DepartmentYourCalling: {
    type: String,
    default: "",
  },
  CallBackAvailable: {
    type: String,
    enum: ["NO", "YES"],
    default: "NO",
  },
  CallPickedUpByARealPerson: {
    type: String,
    enum: ["NO", "YES"],
    default: "NO",
  },
  BestTimeToDail: {
    type: String,
  },
  CallCenterHours: {
    type: String,
  },
  description: {
    type: String,
    default: "",
  },
  approved: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: true,
  },
});

const approvalData = mongoose.model("submissions", approvalDataSchema);
module.exports = approvalData;
