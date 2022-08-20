const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const user = require("./routes/user");
var cors = require('cors');
const organizationRoutes = require("./routes/organizationRoutes");
const searchRoutes = require("./routes/searchRoutes");
dotenv.config();
const InitiateMongoServer = require("./config/db");
// Initiate Mongo Server
InitiateMongoServer();

const app = express();
app.use(cors());
// PORT

// Middleware
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.get("/", (req, res) => {
  console.log("Entereddddddddddddd")
  res.json({ message: "API Working" });
});

/**
 * Router Middleware
 * Router - /user/*
 * Method - *
 */
app.use("/api/user", user);
app.use("/api/organizations",organizationRoutes)
app.use("/api/recentSearch",searchRoutes)
app.listen(process.env.PORT || 4000, (req, res) => {
  console.log(`Server Started at PORT ${process.env.PORT}`);
});
