const mongoose = require("mongoose");
const { setSlugs } = require("../controllers/setSlugsController");

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
    await setSlugs();
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;
