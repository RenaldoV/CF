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

  sendEmail(email, body, link, subject) {
    //validate
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
      link: link
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
  //welcomeTalent//
  welcomeTalent(userFirstName, signupLink, email) {

    //validate
    var missingFields = [];
    if (userFirstName == null || userFirstName == "") {
      missingFields.push("userFirstName")
    }
    if (signupLink == null || signupLink == "") {
      missingFields.push("signupLink")
    }
    if (email == null || email == "") {
      missingFields.push("email")
    }
    if (missingFields.length > 0) {
      throw new EmailError(missingFields);
    }

    let context = {
      name: userFirstName,
      link: signupLink
    };
    let that = this;
    return new Promise((resolve, reject) => {
      that.send("welcomeTalent", context, email, 'Welcome To O-Link').then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  //welcomeEmployer
  welcomeEmployer(userFirstName, signupLink, email) {

    //validate
    var missingFields = [];
    if (userFirstName == null || userFirstName == "") {
      missingFields.push("userFirstName")
    }
    if (signupLink == null || signupLink == "") {
      missingFields.push("signupLink")
    }
    if (email == null || email == "") {
      missingFields.push("email")
    }
    if (missingFields.length > 0) {
      throw new EmailError(missingFields);
    }

    let context = {
      name: userFirstName,
      link: signupLink
    };
    let that = this;
    return new Promise((resolve, reject) => {
      that.send("welcomeEmployer", context, email, 'Welcome To O-Link').then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
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
  // jobLive
  jobLive(userFirstName, category, email) {

    let context = {
      name: userFirstName,
      category: category,
      vowel: this.isVowel(category)
    };
    let that = this;
    return new Promise((resolve, reject) => {
      that.send("jobLive", context, email, 'Job Offer Now Live').then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // jobEditedEmployer
  jobEditedEmployer(userFirstName, category, numberOfApplicants, email) {

    let context = {
      name: userFirstName,
      category: category,
      vowel: this.isVowel(category),
      applicantCount: numberOfApplicants
    };
    let that = this;
    return new Promise((resolve, reject) => {
      that.send("jobEditedEmployer", context, email, 'O-Link: Edited Job Offer Is Now Live').then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // jobEditedTalent
  jobEditedTalent(talentName, employerName, category, startDate, jobLink, email) {

    //TODO: Check out what {{confirmed}}{{prov}}{{pending}} is in the view
    let context = {
      student: talentName,
      employer: employerName,
      category: category,
      vowel: this.isVowel(category),
      date: startDate,
      link: jobLink

    };
    let that = this;
    var subject = "O-Link: Job Offer to Work as"+ ((context.vowel) ? " an " : " a ") + category + " has been Edited - You have 24 hours to respond to the changes";
    return new Promise((resolve, reject) => {
      that.send("jobEditedTalent", context, email, subject).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // offerExpiry
  offerExpiry(userFirstName, category, startDate, applicationsLink, email) {

    //TODO: Check out what {{confirmed}}{{prov}}{{pending}} is in the view
    let context = {
      name: userFirstName,
      category: category,
      vowel: this.isVowel(category),
      date: startDate,
      link: applicationsLink

    };
    let that = this;
    return new Promise((resolve, reject) => {
      that.send("offerExpiry", context, email, 'O-Link: ' + category + " will automatically decline in 2 hours!").then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // jobEditedTimeUp

  jobEditedTimeUp(userFirstName, category, startDate, browseJobsLink, email) {

    //TODO: Check out what {{confirmed}}{{prov}}{{pending}} is in the view
    let context = {
      name: userFirstName,
      category: category,
      vowel: this.isVowel(category),
      date: startDate,
      link: browseJobsLink

    };
    let that = this;
    var subject = "O-Link: Automatically Withdrawn Application to Work as"+((context.vowel) ? " an " : " a ") + category +" – Missed Response Deadline";
    return new Promise((resolve, reject) => {
      that.send("jobEditedTimeUp", context, email, subject).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // offerTimeUp
  offerTimeUp(userFirstName, category, startDate, browseJobsLink, email) {
    let context = {
      name: userFirstName,
      category: category,
      vowel: this.isVowel(category),
      date: startDate,
      link: browseJobsLink

    };
    let that = this;
    var subject = "O-Link: Automatically Declined Provisional Acceptance / Job Commitment to Work as"+((context.vowel) ? " an " : " a ") + category +" – Missed Response Deadline";
    return new Promise((resolve, reject) => {
      that.send("offerTimeUp", context, email, subject).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // applicationMade
  //if isInterview == false then is offer
  applicationMade(talentName, employerName, category, startDate, isInterview, applicationsLeft, email) {

    //TODO: Check out what {{confirmed}}{{prov}}{{pending}} is in the view
    let context = {
      talent: talentName,
      employer: employerName,
      category: category,
      vowel: this.isVowel(category),
      interview: isInterview,
      date: startDate,
      applicationsLeft: applicationsLeft

    };

    let that = this;
    var subject = "O-Link: Application Has Been Made For"+((context.vowel) ? " an " : " a ") + category;

    return new Promise((resolve, reject) => {
      that.send("applicationMade", context, email, subject).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // applicationMadeEmployer
  applicationMadeEmployer(talentName, employerName, category, startDate, isInterview, applicantsLink, email, coverLetter) {
    if (!coverLetter) {
      coverLetter = false;
    }
    let context = {
      talent: talentName,
      employer: employerName,
      category: category,
      vowel: this.isVowel(category),
      interview: isInterview,
      date: startDate,
      link: applicantsLink,
      coverLetter: coverLetter
    };

    let that = this;
    return new Promise((resolve, reject) => {
      that.send("applicationMadeEmployer", context, email, "O-Link: Application Has Been Made For"+((context.vowel) ? " an " : " a ") +category).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // offerMade
  offerMade(talentName, employerName, category, startDate, offerLink, email) {

    let context = {
      talent: talentName,
      employer: employerName,
      date: startDate,
      link: offerLink

    };
    var article = "a";
    if (this.isVowel(category))
      article = "an";

    let that = this;
    return new Promise((resolve, reject) => {
      that.send("offerMade", context, email, "O-Link: Provisionally Accepted As " + article + " " + category).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // offerMadeInterview
  offerMadeInterview(talentName, employerName, category, startDate, offerLink, email) {

    let context = {
      talent: talentName,
      employer: employerName,
      date: startDate,
      link: offerLink

    };

    var article = "a";
    if (this.isVowel(category))
      article = "an";

    let that = this;
    return new Promise((resolve, reject) => {
      that.send("offerMadeInterview", context, email, "O-Link: Interview As " + article + " " + category).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // applicationWithdrawn
  applicationWithdrawn(talentName, employerName, genderPronoun, myApplicantsLink, email) {

        let context = {
          talent: talentName,
          employer: employerName,
          genderM: this.genderM(genderPronoun),
          link: myApplicantsLink
        };

        let that = this;
        return new Promise((resolve, reject) => {
          that.send("applicationWithdrawn", context, email, "O-Link: Withdrawn Application").then(res => {
            resolve(res);
          }).catch(err => {
            reject(err);
          });
        });
      }

  // applicationDenied
  applicationDenied(talentName, employerName, category, browseJobsLink, email) {
    // console.log(talentName + '\n' + employerName + '\n' + category + '\n' + browseJobsLink + '\n' + email);
    let context = {
      talent: talentName,
      employer: employerName,
      link: browseJobsLink
    };

    var article = "a";
    if (this.isVowel(category))
      article = "an";

    let that = this;
    return new Promise((resolve, reject) => {
      that.send("applicationDenied", context, email, "O-Link: Declined For a Job As " + article + " " + category).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // ratePastEmployees
  ratePastEmployees(employerName, category, startDate, rateEmployeesLink, email) {

    let context = {
      employer: employerName,
      category: category,
      vowel: this.isVowel(category),
      link: rateEmployeesLink,
      date: startDate
    };

    let that = this;
    return new Promise((resolve, reject) => {
      that.send("rateStudents", context, email, "O-Link: Please Rate Your Past Employees").then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // talentRated
  talentRated(talentName, employerName, category, startDate, myRatingLink, email) {

    let context = {
      talent: talentName,
      employer: employerName,
      category: category,
      vowel: this.isVowel(category),
      link: myRatingLink,
      date: startDate
    };

    let that = this;
    return new Promise((resolve, reject) => {
      that.send("ratedTalent", context, email, "O-Link: You have received a rating").then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // offerAccepted
  offerAccepted(talentName, employerName, category, startDate, myApplicantsLink, email) {

    let context = {
      talent: talentName,
      employer: employerName,
      category: category,
      vowel: this.isVowel(category),
      link: myApplicantsLink,
      date: startDate
    };

    let that = this;
    return new Promise((resolve, reject) => {
      that.send("offerAccepted", context, email, talentName + " Has Accepted Your Offer").then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // interviewAccepted
  interviewAccepted(talentName, employerName, category, startDate, myApplicantsLink, talentEmail, email) {

    let context = {
      talent: talentName,
      employer: employerName,
      category: category,
      vowel: this.isVowel(category),
      link: myApplicantsLink,
      date: startDate,
      talentEmail: talentEmail
    };

    var article = "a";
    if (this.isVowel(category))
      article = "an";

    let that = this;
    return new Promise((resolve, reject) => {
      that.send("interviewAccepted", context, email, talentName + " Has Accepted Your Interview").then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // paymentReceived
  paymentReceived(talentName, packageBought, applicationsLeft, email) {

    let context = {
      talent: talentName,
      package: packageBought,
      applicationsLeft: applicationsLeft
    };
    let that = this;
    return new Promise((resolve, reject) => {
      that.send("paymentReceived", context, email, packageBought + " Package Purchased").then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }
}

module.exports = Mailer;
