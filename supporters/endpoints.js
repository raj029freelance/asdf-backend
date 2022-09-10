module.exports = function getBaseURL() {
  const environment = process.env.NODE_ENV || "development";
  const baseUrl =
    environment === "development"
      ? `http://localhost:${process.env.PORT}`
      : "https://frozen-hollows-67475.herokuapp.com";

  return baseUrl;
};
