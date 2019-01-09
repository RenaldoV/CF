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
          File.find({})
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
          async.each(files,
            (file, cb) => {
              // console.log('File: ' + file.fileRef + '\n');
              // iterate contacts in file in parallel
              async.each(file.contacts,
                (ct, innerCb) => {
                  const url = host + '/login/' + encodeURI(file._id) + '/' + encodeURI(ct._id);
                  /*mailer.weeklyUpdate(ct.email,ct.name,url,file.milestoneList._id.title,file.fileRef)
                    .then(res => {
                      innerCb();
                    }, (innerError) => {
                      innerCb(innerError);
                    });*/
                  // console.log('contact name: ' + ct.name + '\n');
                }, (err) => {
                  if (err) {
                    cb(err);
                  } else {
                    cb();
                  }
                });
            }, (err) => {
              if(err) {
                console.log('Cron job completed with errors: ' + err);
                callback(err);
              }else {
                console.log('All contacts successfully updated with weekly report');
                callback(null, files);
              }
            });
        }

      ], (err, result) => {
        if(err) {
          console.log(err)
        }
        if(result) {
          const users = result.map(f => f.refUser);
          let distinctUsers = [];
          users.forEach(u => {
            if (distinctUsers.indexOf(u) < 0) {
              distinctUsers.push(u);
            }
          });
          console.log(distinctUsers);
        }
      });
    });
    /*cron.schedule('* * * * *', function() {
      console.log("Every minute");
    });*/
  }
}

module.exports = Scheduler;
