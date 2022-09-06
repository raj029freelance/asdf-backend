const nodemailer = require("nodemailer");

function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

exports.contactUs = async (req, res) => {
  try {
    const { from, subject, name, message } = req.body;
    if (from.trim() === "" || subject.trim() === "" || message.trim() === "") {
      res.status(400).json({
        message: "fill in all the fields",
        status: "fail",
      });
      return;
    }

    if (!validateEmail(from)) {
      res.status(400).json({
        message: "Invalid email",
        status: "fail",
      });
      return;
    }

    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: from,
      to: "shrisaranraj2001@gmail.com", // list of receivers
      subject: name + " | " + subject, // Subject line
      text: message, // plain text body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.send({
      status: "success",
      message: "Message sent successfully",
    });
  } catch (err) {
    res.status(400).json({
      message: err,
      status: "fail",
    });
  }
};
