const DeviceToken = require("../model/deviceTokenModel");
const axios = require("axios");

exports.addToken = async (req, res) => {
  try {
    const { token } = req.body;

    const doesExists = await DeviceToken.find({ token });
    if (doesExists.length > 0) {
      return res.status(200);
    }

    await DeviceToken.create({
      token,
      createdAt: new Date().toISOString(),
    });
    res.status(200);
  } catch (err) {
    res.status(500);
  }
};
