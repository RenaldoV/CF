const nodemailer = require('nodemailer');
const smtpttransport = require('nodemailer-smtp-transport');
const hbs = require('nodemailer-express-handlebars');
const inlineBase64 = require('nodemailer-plugin-inline-base64');
const EmailError = require('./EmailError');
const config = require('../../config/config');

class Mailer {

  constructor(host, port, emailFrom, password) {
    const options = {
      viewEngine: {
        extname: '.hbs',
        layoutsDir: 'server/mailer/views/',
        defaultLayout: 'templates/template',
        partialsDir: 'server/mailer/views/partials'
      },
      viewPath: 'server/mailer/views/views/',
      extName: '.hbs'
    };

    this.emailFrom = emailFrom;
    this.mailer = nodemailer.createTransport(smtpttransport({
      host: host,
      secureConnection: true,
      port: port,
      auth: {
        user: emailFrom,
        pass: password
      },
      tls: { rejectUnauthorized: false }
    }));

    this.mailer.use('compile', hbs(options));
    this.mailer.use('compile', inlineBase64(options))
  }

  send(templateName, context, toEmail, subject) {
    let that = this;
    // Returns promise
    // console.log('sending email to ' + toEmail);
    return new Promise((resolve, reject) => {
      this.mailer.sendMail({
        from: that.emailFrom,
        to: toEmail,
        bcc: config.bccEmail,
        subject: subject,
        template: templateName,
        context: context
      }, (error, response) => {
        if (error) {
          reject(error);
        }
        that.mailer.close();
        resolve(response);

      });
    });
  }

  //Helper function to determine if word starts with a vowel

  sendEmail(email, body, link, subject, button) {
    //validate
    if (!button) {
      button = 'View File';
    }
    var missingFields = [];
    if (email == null || email == "") {
      missingFields.push("email")
    }
    if (body == null || body == "") {
      missingFields.push("body")
    }
    if (link == null || link == "") {
      missingFields.push("link")
    }
    if (missingFields.length > 0) {
      throw new EmailError(missingFields);
    }

    let context = {
      body: body,
      link: link,
      btn: button
    };
    let that = this;
    return new Promise((resolve, reject) => {
      that.send("email", context, email, subject).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }

  adminFileCreated(email, link, fileRef) {
    const message = 'Your file with reference ' + fileRef + ' has successfully been created. \n to view the file click the link below.';
    const subject = 'File successfully created';
    this.sendEmail(email, message, link, subject);
  }
  contactAddedToFile(email, name/*title and surname*/, fileType, fileRef, link) {
    const message = 'Dear ' + name + ', \nyou have been added to a new ' + fileType + ' file with reference ' + fileRef + '. To view the file click the link below.';
    const subject = 'You\'ve been added to a new ' + fileType + ' file';
    this.sendEmail(email, message, link, subject);
  }
  // forgotPassword
  forgotPassword(name, forgotPasswordLink, email) {
    let context = {
      name: name,
      link: forgotPasswordLink
    };
    let that = this;
    return new Promise((resolve, reject) => {
      that.send("forgotPassword", context, email, 'ConveyFeed Password Reset Requested').then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  userCreated(name, email, link) {
    const message = 'Hi '+ name +' \nYou were added as a ConveyFeed admin user / secretary. \n Click the link below to register your account.';
    const subject = 'You were added as a ConveyFeed admin user / secretary';
    this.sendEmail(email, message, link, subject, 'Register');
  }
  commentMade(adminName, email, comment, propDesc, milestone, link) {
    const context = {
      name: adminName,
      comment: comment,
      propDesc: propDesc,
      milestone: milestone,
      link: link
    };
    const subject = 'New comment made by ' + adminName;
    return new Promise((resolve, reject) => {
      this.send('comment', context, email, subject).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  weeklyUpdate(email, name, link, fileType, fileRef) {
    const message = 'Dear ' + name + ', \nherewith your weekly summary report. To view the file click the link below.';
    const subject = fileType + ' file weekly report';
    return new Promise((resolve, reject) => {
      this.sendEmail(email, message, link, subject).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  weeklyUpdateSec(email, name, link, counts) {
    const subject = 'Weekly scheduled reports have been sent out successfully.';
    const context = {
      name: name,
      link: link,
      counts: counts
    };
    return new Promise((resolve, reject) => {
      this.send('weeklyUpdateSec', context, email, subject)
        .then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
}

module.exports = Mailer;
