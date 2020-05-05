const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "f60bf76373e6ce",
    pass: "a6c1d229468468"
  }
});
