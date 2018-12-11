var nodemailer = require('nodemailer');
var smtpttransport = require('nodemailer-smtp-transport');
var hbs = require('nodemailer-express-handlebars');
var inlineBase64 = require('nodemailer-plugin-inline-base64');
var EmailError = require('./EmailError');
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
    //Returns promise
    console.log('sending email to ' + toEmail);
    return new Promise((resolve, reject) => {
      this.mailer.sendMail({
        from: that.emailFrom,
        to: toEmail,
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
  isVowel(word) {
    const vowels = ['a', 'e', 'o', 'i', 'u'];
    for (const vowel of vowels) {
      if (word[0].toLowerCase() === vowel) {
        return true;
      }
    }
    return false;
  }
  genderM(gender) {
    console.log(gender);
    if ( gender === 'M' ) {
      return true
    }else {
      return false;
    }
  }

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
  contactAddedToFile(email, name, fileType, fileRef, link) {
    const message = 'Hi ' + name + ', \nyou have been added to a new ' + fileType + ' file with reference ' + fileRef + '. To view the file click the link below.';
    const subject = 'You\'ve been added to a new ' + fileType + ' file';
    this.sendEmail(email, message, link, subject);
  }
  // forgotPassword
  forgotPassword(userFirstName, forgotPasswordLink, email) {
    let context = {
      name: userFirstName,
      link: forgotPasswordLink
    };
    let that = this;
    return new Promise((resolve, reject) => {
      that.send("forgotPassword", context, email, 'O-Link Password Reset Requested').then(res => {
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
}

module.exports = Mailer;
