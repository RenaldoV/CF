const cron = require('node-cron');
const express = require('express');
const app = express();
const userRoutes = express.Router();
const User = require('../models/user');
const List = require('../models/milestoneList');
const Milestone = require('../models/milestone');
const Properties = require('../models/properties');
const Contact = require('../models/contact');
const File = require('../models/file');
const Mailer = require ('../mailer/mailer');
const Sms = require('../smsModule/sms');
const async = require('async');
const mailer = new Mailer("slash.aserv.co.za", 465, "donotreply@conveyfeed.co.za", "D0N0tRep3y@C0nV5yF@ee#d@2018@!");


class Scheduler {

  constructor (host) {
    console.log('new Scheduler with host : ' + host);
    this.scheduleReports(host);
  }

  scheduleReports (host) {
    cron.schedule('0 0 15 * * Friday', function() {
      console.log("Kicking off scheduled weekly updates");
      async.waterfall([
        (cb) => { // get all files in db that are not archived
          File.find({archived: {$ne : true}}) // TODO: Test this
            .populate('contacts')
            .populate('milestoneList._id', 'title')
            .populate('refUser', 'email name')
            .exec((err, files) => { // TODO: only add non-archived files in report
              if(err) {
                cb(err);
              } else {
                cb(null, files);
              }
            })
        },
        (files, callback) => {
          // Iterate Files in parallel
          let counts = {
            files: 0,
            contacts: 0
          };
          async.each(files,
            (file, cb) => {
              // increment number of open files
              counts.files++;
              // iterate contacts in file in parallel
              async.each(file.contacts,
                (ct, innerCb) => {
                  const url = host + '/login/' + encodeURI(file._id) + '/' + encodeURI(ct._id);
                  mailer.weeklyUpdate(
                    ct.email,
                    ct.title + ' ' + ct.surname,
                    url,file.milestoneList._id.title,
                    file.fileRef
                  ).then(res => {
                      // increment number of contacts emailed.
                      counts.contacts++;
                      innerCb();
                    }, (innerError) => {
                      innerCb(innerError);
                    });
                }, (err) => {
                  if (err) {
                    cb(err);
                  } else {
                    cb();
                  }
                });
            }, (err) => {
              if(err) {
                console.log('Weekly update completed with errors: ' + err);
                callback(err);
              }else {
                console.log('All contacts successfully updated with weekly report. counts: ');
                callback(null, files, counts);
              }
            });
        }

      ], (err, result, counts) => {
        // waterfall main callback
        if(err) {
          console.log(err)
        }
        if(result && counts) {
          // get distinct list of secretaries who worked on open files
          const users = result.map(f => f.refUser);
          const usersArray = [];
          users.forEach(us => {
            us.forEach(u => {
              usersArray.push(u);
            })
          });
          const distinctUsers = Array.from(new Set(usersArray.map(u => u._id)))
            .map(id => {
              return {
                name: usersArray.find(u => u._id === id).name,
                email: usersArray.find(u => u._id === id).email
              }
            });
          // mail all secretaries updates
          distinctUsers.forEach(u => {
            const link = host + '/admin-login/' + encodeURI(u._id);
            mailer.weeklyUpdateSec(u.email, u.name, link, counts)
              .then(res => {}).catch(err => {
                console.log(err);
            });
          });
        }
      });
    });
  }
}

module.exports = Scheduler;
