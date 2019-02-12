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


// TODO: When contact gets deleted it saves null in array of top level admin.
// TODO: Test cron in every situation.

class Scheduler {

  constructor (host) {
    console.log('new Scheduler with host : ' + host);
    this.scheduleReports(host)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })


  }

  scheduleReports (host) {
    let idRegex = /^[a-fA-F0-9]{24}$/;
    let Fridays3pm = '0 15 * * Fri';
    let minute = '* * * * *';
    return new Promise((resolve, reject) => {
      cron.schedule(Fridays3pm, () => {
        console.log("Kicking off scheduled weekly updates");
        async.waterfall([
          (cb) => { // get all files in db that are not archived
            File.find({archived: {$ne : true}})
              .populate('milestoneList._id', 'title')
              .populate('refUser', 'email name')
              .exec((err, files) => {
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
            async.eachSeries(files, (file, fileCb) => {
                // increment number of open files
                counts.files++;
                // wait 1 min if 50 emails have been sent.
                if ((counts.contacts % 50) === 0) {
                  setDelay(60000);
                }
                // iterate contacts in file in parallel
                async.eachSeries(file.contacts, (ct, ctCb) => {
                    const url = host + '/login/' + encodeURI(file._id) + '/' + encodeURI(ct._id);
                    let strId = ct.toString();
                    // make sure id is valid before searching
                    if (idRegex.exec(strId)) {
                      Contact.findById(ct).exec((err, resCt) => {
                        if (err) ctCb(err);
                        else if (resCt) {
                          // check if contact has email, then email report
                          if (resCt.email) {
                            counts.contacts++;
                            mailer.weeklyUpdate(
                              resCt.email,
                              resCt.title + ' ' + resCt.surname,
                              url,
                              file.milestoneList._id.title,
                              file.fileRef
                            );
                            ctCb();
                          } else {
                            ctCb();
                          }
                        }
                      });
                    } else {
                      console.log('Contact doesn\'t have a valid ID. \nContact: ' + ct + '\nFile: ' + file._id);
                    }
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
            reject(err);
          } else {
            console.log(counts);
          }
          if(result && counts) {
            // get distinct list of secretaries who worked on open files
            const users = result.map(f => f.refUser);
            const usersArray = [];
            users.forEach(us => {
              us.forEach(u => {
                usersArray.push(u);
              });
            });
            const distinctUsers = Array.from(new Set(usersArray.map(u => u._id)))
              .map(id => {
                return {
                  name: usersArray.find(u => u._id === id).name,
                  email: usersArray.find(u => u._id === id).email
                }
              });
            // mail all secretaries updates
			console.log(distinctUsers);
            distinctUsers.forEach(u => {
              const link = host + '/admin-login/' + encodeURI(u._id);
              /* mailer.weeklyUpdateSec(u.email, u.name, link, counts)
                .then(res => {
                  resolve();
                }).catch(err => {
                  reject(err);
              }); */
            });
          }
        });
      });
    });
  }
}

function setDelay(time) {
  setTimeout(function(){
  }, time);
}

module.exports = Scheduler;
