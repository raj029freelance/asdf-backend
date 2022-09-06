const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const user = require("./routes/user");
var cors = require("cors");
const schedule = require("node-schedule");
const organizationRoutes = require("./routes/organizationRoutes");
const searchRoutes = require("./routes/searchRoutes");
const pageControlRoutes = require("./routes/pageControlRoutes");
const faqRoutes = require("./routes/faqRoutes");
const approvalDataRoutes = require("./routes/approvalDataRoutes");
const setSlugsRoutes = require("./routes/setSlugsRoutes");
const axios = require("axios");
const smtpRoutes = require("./routes/smtpRoutes");

dotenv.config();
const InitiateMongoServer = require("./config/db");
// Initiate Mongo Server
InitiateMongoServer();

const app = express();
app.use(cors());
// PORT

// Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "API Working" });
});

/**
 * Router Middleware
 * Router - /user/*
 * Method - *
 */
app.use("/api/user", user);
app.use("/api/organizations", organizationRoutes);
app.use("/api/recentSearch", searchRoutes);
app.use("/api/pageControl", pageControlRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/submissions", approvalDataRoutes);
app.use("/api/setSlugs", setSlugsRoutes);
app.use("/api/contact", smtpRoutes);

app.listen(process.env.PORT || 4000, (req, res) => {
  console.log(`Server Started at PORT ${process.env.PORT}`);
});

schedule.scheduleJob("0 0 * * *", () => {
  const environment = process.env.NODE_ENV || "development";
  const baseUrl =
    environment === "development"
      ? `http://localhost:${process.env.PORT}`
      : "https://frozen-hollows-67475.herokuapp.com";
  axios
    .post(`${baseUrl}/api/setSlugs`, {})
    .then((res) => {
      console.log("CRON job success");
    })
    .catch((err) => {
      console.log("CRON failed", err);
    });
});
