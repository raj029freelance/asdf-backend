const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const organizationSchema = new mongoose.Schema({
    CompanyName : {
        type : String,
        required : [true,'Organization must have a name']
    },
    CompanyUrl : {
        type : String,
    },

    PhoneNumber : {
        type : String ,
        default : ""
    },
    DepartmentYourCalling : {
        type : String ,
        default : ""
    },
    CallBackAvailable  : {
        type  : String,
        enum : ['NO', 'YES'],
        default : "NO"
    },
    CallPickedUpByARealPerson : {
        type  : String,
        enum : ['NO', 'YES'],
        default : "NO"
    },
    BestTimeToDail : {
        type : String ,
    },
    CallCenterHours : {
        type : String ,
    },
    CompanyUrl : {
      type : String
    },
    LetterUrl : {
        type : String
    },
    Letter : {
        type : String
    },
    description : {
        type : String,
        default : ""
    }
});
organizationSchema.plugin(mongoosePaginate);
const Organization = mongoose.model('Organization' , organizationSchema);
module.exports = Organization;