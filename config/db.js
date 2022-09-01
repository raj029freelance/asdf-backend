const mongoose = require("mongoose");
const {
  setSlugsIfUndefined: faqSlugSetter,
} = require("../controllers/faqController");
const {
  setSlugsIfUndefined: orgSlugSetter,
} = require("../controllers/organizationController");
const {
  setSlugsIfUndefined: searchSlugSetter,
} = require("../controllers/searchController");

// Replace this with your MONGOURI.

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log("Connected to DB !!");
    await orgSlugSetter();
    await faqSlugSetter();
    await searchSlugSetter();
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;
