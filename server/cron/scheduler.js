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
const Entity = require('../models/entity');
const Mailer = require ('../mailer/mailer');
const Sms = require('../smsModule/sms');
const async = require('async');
const config = require('../../config/config');
const mailer = new Mailer(config.emailHost, config.emailPort, config.fromEmail, config.emailApiKey, config.emailUsername);
const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');


// TODO: When contact gets deleted it saves null in array of top level admin.
// TODO: Scheduled mails to entities

class Scheduler {

  constructor (host) {
    console.log('new Scheduler with host : ' + host);
    this.scheduleReports(host)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
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
              .select('propertyDescription contacts milestoneList summaries')
              .populate('milestoneList._id', 'title')
              .populate('summaries.user', 'name')
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
              contacts: 0,
              entities: 0
            };
            async.eachSeries(files, (file, fileCb) => {
                // increment number of open files
                counts.files++;
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
                            mailer.weeklyUpdate(
                              resCt.email,
                              resCt.title + ' ' + resCt.surname,
                              url,
                              file
                            );
                            counts.contacts++;
                            // wait 1 min if 50 emails have been sent.
                            if ((counts.contacts % 50) === 0) {
                              // console.log('entering if with wait');
                              setTimeout(() => {
                                console.log('\n'+ counts.contacts +' contacts sent\n');
                                ctCb();
                              }, 60000);
                            } else {
                              // console.log('callback to contact loop because 5o contacts not yet sent');
                              ctCb();
                            }
                          } else {
                            // console.log('callback to contact loop because email doesn\'t exist');
                            ctCb();
                          }
                        } else {
                          // console.log('callback to contact loop because contact doesn\'t exist');
                          ctCb();
                        }
                      });
                    } else {
                      console.log('Contact doesn\'t have a valid ID. \nContact: ' + ct + '\nFile: ' + file._id);
                      ctCb();
                    }
                  }, (err) => {
                    if (err) {
                      fileCb(err);
                    } else {
                      // console.log('callback to file loop');
                      fileCb();
                    }
                  });
              }, (err) => {
                if(err) {
                  console.log('Weekly update completed with errors: ' + err);
                  callback(err);
                } else {
                  console.log('All contacts successfully updated with weekly report. counts: ');
                  callback(null, counts);
                }
              });
          },
          (counts, callback) => { // get entities
            Entity.find()
              .populate('contacts', 'surname title email')
              .exec((err, entities) => {
                if(err) callback(err);
                else {
                  callback(null, entities, counts);
                }
              })
          },
          (entities, counts, callback) => { // iterate entities and send email to all contacts
            async.eachSeries(entities, (entity, entCb) => {
              counts.entities++;
              let contacts = 0; // used to see how many contacts in entities mailed
              // iterate contacts in entity in parallel
              async.eachSeries(entity.contacts, (ct, ctCb) => {
                const url = host + '/entity-login/' + encodeURI(entity._id) + '/' + encodeURI(ct._id);
                // check if contact has email, then email report
                if (ct.email) {
                  mailer.entityWeeklyUpdate(
                    ct.email,
                    ct.title + ' ' + ct.surname,
                    url,
                    entity
                  );
                  contacts++;
                  // wait 1 min if 50 emails have been sent.
                  if ((contacts % 50) === 0) {
                    // console.log('entering if with wait');
                    setTimeout(() => {
                      console.log('\n'+ counts.contacts +' contacts sent\n');
                      ctCb();
                    }, 60000);
                  } else {
                    // console.log('callback to contact loop because 5o contacts not yet sent');
                    ctCb();
                  }
                } else {
                  // console.log('callback to contact loop because email doesn\'t exist');
                  ctCb();
                }
              }, (err) => {
                // contacts loop callback
                if(err) entCb(err);
                else {
                  entCb();
                }
              });
            }, (err) => {
              // entities loop callback
              if(err) callback(err);
              else {
                callback(null, counts);
              }
            })
          }
        ], (err, counts) => {
          // waterfall main callback
          if(err) {
            reject(err);
          } else {
            console.log(counts);
          }
          if(counts) {
            // get list of secretaries who worked on open files
            User.find().exec((err, usr) => {
              usr.forEach(u => {
                const link = host + '/admin-login/' + encodeURI(u._id);
                mailer.weeklyUpdateSec(u.email, u.name, link, counts)
                  .then(res => {
                    resolve();
                  }).catch(err => {
                  reject(err);
                });
              });
            });
          }
        });
      });
    });
  }

}

const setDelay = async function () {
  return await new Promise(resolve => setTimeout((resolve, time)));
};

module.exports = Scheduler;
