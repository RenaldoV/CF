const express = require('express');
const app = express();
const userRoutes = express.Router();
const User = require('../models/user');
const List = require('../models/milestoneList');
const Milestone = require('../models/milestone');
const Properties = require('../models/properties');
const Contact = require('../models/contact');
const File = require('../models/file');
const bcrypt = require('bcrypt');
const Mailer = require ('../mailer/mailer');
const mailer = new Mailer("mail.carbonsoft.co.za", 465, "ronnie@carbonsoft.co.za", "Carbon@Ronnie2018");
const async = require('async');

// ============================ ADMIN ROUTES ===========================
userRoutes.route('/addUser').post((req, res, next) => {
  let user = req.body;
  let saltRounds = 10;
  let newUser = {};
  bcrypt.hash(user.passwordHash, saltRounds, (err, hash) => {
    // Store hash in your password DB.
    if (err) return next(err);
    user.passwordHash = hash;
    User.create(user, (err, result) => {
      if (err) return next(err);
      if (result) {
        res.json(user);
        // console.log('successful creation: \n' + user);
        // console.log(result);
      }else {
        console.log('unsuccessful creation: \n' + result);
        res.send(false);
      }
    })
  });
});
userRoutes.route('/login').post((req, res, next) => {
  let user = req.body;
  User.findOne({email : user.email}, '_id name surname passwordHash email', (err, usr) => {
    if (err) return next(err);
    if (usr) {
      usr = usr.toObject();
      bcrypt.compare(user.password, usr.passwordHash, (err, pwMatch) => {
        if (err) return next(err);
        if(pwMatch) {
          delete usr.passwordHash;
          res.send(usr);
        }else {
          res.send(false);
        }

      });
    }
  });
});
userRoutes.route('/getRole').post((req, res, next) => {
  let id = req.body._id;
  User.findById(id, 'role', (err, result) => {
    res.send(result);
  })
});
// ============================ ADMIN ROUTES ===========================
// ============================ MILESTONE LIST ROUTES  =================
userRoutes.route('/addList').post((req, res, next) => {
  let list = req.body;
  delete list._id;
  list.milestones = [];
  List.create(list, (err, resList) => {
    if (err) return next(err);
    if (resList) {
      User.findByIdAndUpdate(resList.updatedBy, {$push: {milestoneLists: resList._id}}, (er, userRes) => {
      res.json(resList);
    });
  }else {
    console.log('unsuccessful creation: \n' + result);
    res.send(false);
  }
  })
});
userRoutes.route('/addMilestones').post((req, res, next) => {
  let milestones = req.body.milestones;
  milestones.forEach(m => {delete m._id});
  let listID = req.body.listID;
  Milestone.insertMany(milestones, (err, resMs) => {
    if (err) return next(err);
    if (resMs) {
      let mIds = resMs.map((id) => {return id['_id']});
      console.log(mIds);
      List.findByIdAndUpdate(listID, {$push: {milestones:{$each: mIds}}}, {new: true}).populate('milestones').exec((er, mRes) => {
        res.json(mRes);
      });
    }else {
      console.log('unsuccessful creation: \n' + result);
      res.send(false);
    }
  })
});
userRoutes.route('/addMilestone').post((req, res, next) => {
  let m = req.body.m;
  delete m._id;
  let listID = req.body.listID;
  Milestone.create(m, (err, resM) => {
    if (err) {
      console.log(err);
      res.send(false);
    }
    if (resM) {
      let mId = resM._id;
      console.log(mId);
      List.findByIdAndUpdate(listID, {$push: {milestones: mId}}, {new: true}).populate('milestones').exec((er, mRes) => {
        if (er) {
          console.log(er);
          res.send(false);
        }else if(mRes) {
          console.log('new list: \n' + mRes);
          res.json(mRes);
        }else {
          console.log('unsuccessful creation: \n' + result);
          res.send(false);
        }
      });
    }else {
      console.log('unsuccessful creation: \n' + result);
      res.send(false);
    }
  })
});
userRoutes.route('/deleteMilestone').post((req, res, next) => {
  const id = req.body.id;
  const listID = req.body.listID;
  Milestone.findByIdAndRemove(id, (err, result) => {
    if (err) {
      console.log(err);
      res.send(false);
    }
    else if (result) {
      List.findByIdAndUpdate(listID, {$pull: {milestones: id}}, (er, result1) =>{
        if(er) {
          console.log(er);
          res.send(false);
        }
        else if(result1) {
          res.send(true)
        }else {
          res.send(false);
        }
      });
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/updateMilestone').post((req, res, next) => {
  const m = req.body;
  Milestone.findByIdAndUpdate(m._id, m, (err, result) => {
    if (err) {
      console.log(err);
      res.send(false);
    }
    else if (result) {
      console.log(result);
      res.send(true);
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/list').get((req, res, next) => {
  // get all milestone Lists
  // TODO: get lists from specific user and not just all lists in DB
  List.find().populate('milestones').exec((err, lists) => {
    console.log(err);
    if (lists) {
      res.json(lists);
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/lists/:id').get((req, res, next) => {
  // get all milestone Lists
  const id = req.params.id;
  List.findById(id).populate('milestones').exec((err, list) => {
    if(err) throw next(err);
    if (list) {
      res.json(list);
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/deleteList').post((req, res, next) => {
  const id = req.body.lid;
  const uid = req.body.uid;
  List.findByIdAndRemove(id, (err, result) => {
    if (err) {
      console.log(err);
      res.send(false);
    }
    else if (result) {
      Milestone.deleteMany({_id: {$in: result.milestones}}, (er, result1) =>{
        if(er) {
          console.log(er);
          res.send(false);
        }
        else if(result1) {
          User.findByIdAndUpdate(uid, {$pull: {milestoneLists: id}}, (e, result2) => {
            if (e) {
              console.log(e);
              res.send(false);
            } else if (result2) {
              res.send(true);
            } else {
              res.send(false);
            }
          });
        }else {
          res.send(false);
        }
      });
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/updateList').post((req, res, next) => {
  const list = req.body;
  List.findByIdAndUpdate(list._id, list, {new: true}).populate('milestones').exec((err, result) => {
    if (err) {
      console.log(err);
      res.send(false);
    }
    else if (result) {
      console.log(result);
      res.send(result);
    } else {
      res.send(false);
    }
  });
});
// ============================ MILESTONE LIST ROUTES  =================
// ============================ ADMIN PROPERTIES ROUTES  ===============
userRoutes.route('/addProperties').post((req, res, next) => {
  const prop = req.body.properties;
  const uid = req.body.uid;
  Properties.create(prop, (err, resP) => {
    if(err) {
      console.log(err);
      res.send(false);
    }else if(resP) {
      User.findByIdAndUpdate(uid, {properties: resP._id}, (er, resU) => {
        if(er) {
          console.log(er);
          res.send(false);
        }else if(resU) {
          res.send(resP);
        }
      });
    }
  });
});
userRoutes.route('/properties/:id').get((req, res, next) => {
  // get user's properties
  const id = req.params.id;
  User.findById(id).populate('properties').exec((err, user) => {
    if(err) {
      console.log(err);
      res.send(false);
    }
    if (user) {
      res.json(user.properties);
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/hasProperties/:id').get((req, res, next) => {
  // get user's properties
  const id = req.params.id;
  User.findById(id, 'properties', (err, user) => {
    if(err) {
      console.log(err);
      res.send(false);
    }
    console.log(user.properties);
    if (user.properties) {
      res.json(true);
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/updateProperties').post((req, res, next) => {
  const prop = req.body.properties;
  const uid = req.body.uid;
  User.findById(uid, 'properties', (err, user) => {
    if(err) {
      console.log(err);
      res.send(false);
    }
    if (user) {
      Properties.findByIdAndUpdate(user.properties, {
        propertyTypes: prop.propertyTypes,
        deedsOffices: prop.deedsOffices,
        actionTypes: prop.actionTypes
      }, {new: true}, (er, pRes) => {
        if(er) {
          console.log(er);
          res.send(false);
        }
        if(pRes) {
          res.send(pRes);
        }else {
          res.send(false);
        }
      })
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/addOneActionProperty').post((req, res, next) => {
  const action = req.body.action;
  const uid = req.body.uid;
  User.findById(uid, 'properties', (err, user) => {
    if(err) {
      console.log(err);
      res.send(false);
    }
    if (user) {
      Properties.findByIdAndUpdate(user.properties, {
        $push: {actionTypes: action}
      }, (er, pRes) => {
        if(er) {
          console.log(er);
          res.send(false);
        }
        if(pRes) {
          res.send(true);
        }else {
          res.send(false);
        }
      })
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/addOnePropType').post((req, res, next) => {
  const pt = req.body.propertyType;
  const uid = req.body.uid;
  User.findById(uid, 'properties', (err, user) => {
    if(err) {
      console.log(err);
      res.send(false);
    }
    if (user) {
      Properties.findByIdAndUpdate(user.properties, {
        $push: {propertyTypes: pt}
      }, (er, pRes) => {
        if(er) {
          console.log(er);
          res.send(false);
        }
        if(pRes) {
          res.send(true);
        }else {
          res.send(false);
        }
      })
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/addOneDeedsOffice').post((req, res, next) => {
  const d = req.body.deedsOffice;
  const uid = req.body.uid;
  User.findById(uid, 'properties', (err, user) => {
    if(err) {
      console.log(err);
      res.send(false);
    }
    if (user) {
      Properties.findByIdAndUpdate(user.properties, {
        $push: {deedsOffices: d}
      }, (er, pRes) => {
        if(er) {
          console.log(er);
          res.send(false);
        }
        if(pRes) {
          res.send(true);
        }else {
          res.send(false);
        }
      })
    }else {
      res.send(false);
    }
  });
});
// ============================ ADMIN PROPERTIES ROUTES  ===============
// ============================ CONTACTS ROUTES  =======================
userRoutes.route('/addContact').post((req, res, next) => {
  let contact = req.body.contact;
  contact.verified = false;
  let uid = req.body.uid;
  contact.passwordHash = Math.random().toString(36).substring(10);
  // console.log(contact.passwordHash);
  let saltRounds = 10;
  bcrypt.hash(contact.passwordHash, saltRounds, (err, hash) => {
    // Store hash in your password DB.
    if (err) {
      console.log(err);
      res.send(false);
    }
    contact.passwordHash = hash;
    Contact.create(contact, (er, ct) => {
      if (er) {
        console.log(er);
        res.send(false);
      }
      if (ct) {
        User.findByIdAndUpdate(uid, {$push: {contacts: ct._id}}, (e, usr) => {
          if (e) {
            console.log(e);
            res.send(false);
          }
          if (usr) {
            /*console.log('successful creation: \n' + ct);*/
            res.json(ct);
          }
        });
      } else {
        console.log('unsuccessful creation: \n' + result);
        res.send(false);
      }
    })
  });
});
userRoutes.route('/contacts/:id').get((req, res, next) => {
  // get user's contacts
  const id = req.params.id;
  User.findById(id, 'contacts').populate('contacts').exec((err, user) => {
    if(err) {
      console.log(err);
      res.send(false);
    }
    if (user) {
      res.json(user.contacts);
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/deleteContact').post((req, res, next) => {
  const cid = req.body.cid;
  const uid = req.body.uid;
  Contact.findByIdAndRemove(cid, (err, result) => {
    if (err) {
      console.log(err);
      res.send(false);
    }
    else if (result) {
      User.findByIdAndUpdate(uid, {$pull: {contacts: cid}}, (er, result1) => {
        if (er) {
          console.log(er);
          res.send(false);
        } else if (result1) {
          res.send(true);
        } else {
          res.send(false);
        }
      });
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/updateContact').post((req, res, next) => {
  const ct = req.body;
  Contact.findByIdAndUpdate(ct._id, ct, {new: true}, (er, ctRes) => {
        if(er) {
          console.log(er);
          res.send(false);
        }
        if(ctRes) {
          res.send(ctRes);
        }else {
          res.send(false);
        }
      })
});
userRoutes.route('/contacts/:uid/:search').get((req, res, next) => {
  // get user's contacts
  const uid = req.params.uid;
  const searchTerm = req.params.search;

  User.findById(uid, 'contacts').populate('contacts', 'name email cell type').exec((err, user) => {
    if(err) {
      console.log(err);
      res.send(false);
    }
    if (user) {
      res.send(find(user.contacts, searchTerm));
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/contact/:email/:uid').get((req, res, next) => {
  // get user's contacts
  const uid = req.params.uid;
  const email = req.params.email;

  User.findById(uid, 'contacts').populate('contacts', 'name email cell type').exec((err, user) => {
    if(err) {
      console.log(err);
      res.send(false);
    }
    if (user) {
      let userExists = false;
      user.contacts.forEach(ct => {
        if (ct.email === email)
          userExists = true;
      });
      res.send(userExists);
    }else {
      res.send(false);
    }
  });
});
// ============================ CONTACTS ROUTES  =======================
// ============================ FILE ROUTES  ===========================
userRoutes.route('/addFile').post((req, res, next) => {
  let file = req.body.file;
  let uid = req.body.uid;
  file.createdBy = uid;
  file.updatedBy = uid;
  async.waterfall([
    (callback) => { // first method: Get milestone list associated to file and build new file with milestones array
      List.findById(file.milestoneList, 'milestones').exec((error, list) => {
        if (error) {
          callback(error);
        }
        if (list) {
          let newList = new Object();
          newList.milestones = list.milestones.map(ms => {
            return new Object({_id: ms, completed: false, updatedBy: uid, updatedAt: new Date()})
          });
          newList._id = list._id;
          file.milestoneList = newList;
          console.log('found list: \n');
          callback(null, file);
        } else {
          console.log('unsuccessful creation: \n');
          res.send(false);
        }
      });
    }, (file, callback) => { // Second method: Insert File
      console.log('New File : \n' + file);
      File.create(file, (error, f) => {
        if (error) {
          callback(error);
        }
        if (f) {
          callback(null, f);
        } else {
          console.log('unsuccessful creation: \n');
          res.send(false);
        }
      })
    }, (file, callback) => { // Third method: Update user files array with new file _id
      console.log('file created, result: \n' + file);
      User.findByIdAndUpdate(uid, {$push: {files: f._id}}, (error, usr) => {
        if (error) {
          callback(error);
        }
        if (usr) {
          callback(null, file, usr);
        }
      });
    }, (file, usr, callback) => { // get contacts and send out emails
      File.findById(file._id).populate('contacts').exec((error, f) => {
        const host = req.protocol + '://' + req.get('host');
        const fileURL = host  + '/file/' + encodeURI(file._id);
        const loginUrl = host + '/login/' + encodeURI(file._id);
        f.contacts.forEach(ct => {
          if (ct.verified) {
            mailer.contactAddedToFile(ct.email, ct.name, file.action, loginUrl);
          } else {
            const registerURL = loginUrl + '/' + encoded(ct._id);
            mailer.contactAddedToFile(ct.email, ct.name, file.action, registerURL);
          }
        });
      });
    }
  ], (err, results) => {
    if (err) {
      console.log(err);
      res.send(false);
    }
  });
});
userRoutes.route('/files/:id').get((req, res, next) => {
  // get user's Files
  const id = req.params.id;
  User.findById(id, 'files').exec((err, user) => {
    if(err) {
      console.log(err);
      res.send(false);
    }
    if (user) {
      File.find({_id: {$in: user.files}}).populate('milestoneList.milestones._id').populate('milestoneList.milestones.updatedBy', 'name')
        .populate('contacts').populate('milestoneList.milestones.comments.user', 'name').populate('createdBy', 'name').populate('updatedBy', 'name').exec((er, files) => {
        if (er) {
          console.log(er);
          res.send(false);
        } else if (files) {
          res.send(files);
        } else {
          res.send(false);
        }
      });
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/completeMilestone').post((req, res, next) => {
  let fileID = req.body.fileID;
  let milestoneID = req.body.milestoneID;
  let uid = req.body.uid;
  File.findOneAndUpdate(
    {_id: fileID, 'milestoneList.milestones._id': milestoneID},
    {$set: {'milestoneList.milestones.$.completed': true}}, {new: true}).exec((err, newFile) => {
      if (err) {
        console.log(err);
        res.send(false);
      }
      if (newFile) {
        async.parallel({
          contacts: (callback) => {
            Contact.find({_id: {$in: newFile.contacts}}).exec((er, cts) => {
              callback(er, cts);
            });
          },
          adminUser: (callback) => {
            User.findById(uid, (er, user) => {
              callback(er, user);
            });
          },
          milestone: (callback) => {
            Milestone.findById(milestoneID, (er, m) => {
              callback(er, milestoneID);
            });
          }
        }, (er, callback) => {
          if (er) {
            console.log(err);
            res.send(false);
          } else if (callback.contacts && callback.adminUser && callback.milestone) {
            let messageBody = callback.milestone.notificationMessage;
            const milestoneName = callback.milestone.name;
            messageBody = messageBody.split('*deeds_office*').join(newFile.deedsOffice);
            messageBody = messageBody.split('*erf_name*').join(newFile.erfNumber);
            messageBody = messageBody.split('*my_name*').join(callback.adminUser.name);
            const url = req.protocol + '://' + req.get('host');
            callback.contacts.forEach(ct => {
              const email = ct.email;
              messageBody = messageBody.split('*contact_name*').join(ct.name);
              if (callback.milestone.sendEmail) {
                mailer.sendEmail(email, messageBody, url, milestoneName + ' milestone has been completed.');
              }
            });
            res.send({
              message: 'Milestone successfully marked as complete' + (callback.milestone.sendEmail || callback.milestone.sendSMS ? ', and all parties notified.' : '.')
            });
          } else {
            res.send(false);
          }
        });
      } else {
        res.send(false);
      }
  })
});
userRoutes.route('/addComment').post((req, res, next) => {
  let fileID = req.body.fileID;
  let milestoneID = req.body.milestoneID;
  let comment = {
    user: req.body.uid,
    comment: req.body.comment,
    timestamp: new Date()
  };
  File.findOneAndUpdate(
    {_id: fileID, 'milestoneList.milestones._id': milestoneID},
    { $push: {'milestoneList.milestones.$.comments': comment}}, {fields: 'milestoneList.milestones.$.comments'}).populate('milestoneList.milestones.comments.user', 'name').exec((err, result) => {
    if (err) {
      console.log(err);
      res.send(false);
    }
    if (result) {
      User.findById(comment.user, 'name', (er, user) => {
        comment.user = user;
        res.send(comment);
      });
    } else {
      res.send(false);
    }
  })
});
module.exports = userRoutes;

function find(items, text) {
  text = text.toLowerCase();
  text = text.split(' ');
  return items.filter((item) => {
    return text.every((el) => {
      return item.name.toLowerCase().indexOf(el) > -1 || item.cell.indexOf(el) > -1 || item.email.toLowerCase().indexOf(el) > -1 || item.type.toLowerCase().indexOf(el) > -1;
    });
  });
}
