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
const bcrypt = require('bcrypt');
const Mailer = require ('../mailer/mailer');
const Sms = require('../smsModule/sms');
const crypto = require('crypto');
const smser = new Sms();
const config = require('../../config/config');
const mailer = new Mailer(config.emailHost, config.emailPort, config.fromEmail, config.emailApiKey, config.emailUsername);
const async = require('async');


// ============================ ADMIN ROUTES ===========================
userRoutes.route('/addUser').post((req, res, next) => {
  let user = req.body;
  let saltRounds = 10;
  bcrypt.hash(user.passwordHash, saltRounds, (err, hash) => {
    // Store hash in your password DB.
    if (err) {
      return next(err);
    } else {
      user.passwordHash = hash;
      if (!user.company) {
        user.verified = false;
      }
      User.create(user, (err, result) => {
        if (err) {
          return next(err);
        } else {
          if (result) {
            if (!result.company) { // not top level admin, send registration email
              const host = req.protocol + '://' + req.get('host');
              const loginUrl = host + '/admin-login/' + encodeURI(result._id);
              mailer.userCreated(result.name, result.email, loginUrl);
            }
            res.json(result);
          }else {
            res.send(false);
          }
        }
      })
    }
  });
});
userRoutes.route('/userByEmail/:email').get((req, res, next) => {
  // get user by email to check email availability
  const email = req.params.email;
  User.findOne({email: email}).exec((err, user) => {
    if(err) {
      return next(err);
    } else {
      console.log(user);
      res.send(user);
    }
  });
});
userRoutes.route('/users/:id').get((req, res, next) => {
  // get all users but me and admin user
  const myId = req.params.id;
  User.findById(myId).exec((er, me) => {
    if (er) {
      return next(er);
    }else if(me.company) { // i am top level admin
      User.find({_id: {$ne: myId}}).exec((err, users) => {
        if(err) {
          console.log(err);
          res.send(false);
        }
        res.json(users);
      });
    } else if (me) { // i am not top level but I exist
      User.find({_id: {$ne: myId}, companyAdmin: {$ne: null}}).exec((err, users) => { // select all but me, and top level admin
        if(err) {
          console.log(err);
          res.send(false);
        }
        res.json(users);
      });
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/allUserNames').get((req, res, next) => {
  // get all  user names
  User.find({}, {name: 1}).exec((er, users) => {
    if (er) {
      return next(er);
    } else if (users) {
      res.send(users);
    } else {
      res.end(false);
    }
  });
});
userRoutes.route('/user/:id').get((req, res, next) => {
  // get me
  const myId = req.params.id;
  User.findById(myId).exec((er, me) => {
    if (er) {
      return next(er);
    } else if (!me.company) { // i am not top level admin
      res.send(me);
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/login').post((req, res, next) => {
  let user = req.body;
  User.findOne({email : user.email}, '_id name surname passwordHash email company companyAdmin', (err, usr) => {
    if (err) {
      return next(err);
    } else if (usr) {
      usr = usr.toObject();
      bcrypt.compare(user.password, usr.passwordHash, (err, pwMatch) => {
        if (err) return next(err);
        else if(pwMatch) {
          delete usr.passwordHash;
          res.send(usr);
        } else {
          res.send(false);
        }
      });
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/getRole').post((req, res, next) => {
  let id = req.body._id;
  User.findById(id, 'role', (err, result) => {
    if (err) {
      return next(err);
    } else if (result) {
      if(result.role) {
        res.send(result);
      }else {
        res.end(false);
      }
    }else {
      res.end(false);
    }
  })
});
userRoutes.route('/updateUser').post((req, res, next) => { // update password and normal update
  const u = req.body;
  if (u.passwordHash) {
    let saltRounds = 10;
    bcrypt.hash(u.passwordHash, saltRounds, (err, hash) => {
      if (err) {
        return next(err);
      } else {
        u.passwordHash = hash;
        User.findByIdAndUpdate(u._id, u, {new: true}, (er, uRes) => {
          if(er) {
            return next(er);
          } else if(uRes) {
            res.send(uRes);
          }else {
            res.send(false);
          }
        });
      }
    });
  } else {
    User.findByIdAndUpdate(u._id, u, {new: true}, (er, uRes) => {
      if(er) {
        return next(er);
      } else if(uRes) {
        res.send(uRes);
      }else {
        res.send(false);
      }
    })
  }
});
userRoutes.route('/deleteUser').post((req, res, next) => {
  const uid = req.body.id;
  User.findOneAndRemove({_id: uid, companyAdmin: {$ne: null}}, (err, result) => { // make sure not deleting top level user
    if (err) {
      return next(err);
    } else if (result) {
      res.send(true);
    } else {
      res.send(false);
    }
  });
});
// Forgot Password
userRoutes.route('/checkEmailUser').post((req ,res, next) => {
  let email = req.body.email;
  User.findOne({email : email}, (err, usr) => {
    if (err) {
      return next(err);
    }
    if (usr) {
      if (usr.verified) {
        crypto.randomBytes(20, (er, buf) => {
          if (er) {
            return next(er);
          }
          let token = buf.toString('hex');
          User.update({_id: usr._id},
            {'forgotPassword.token': token, 'forgotPassword.expiry': Date.now() + 1800000 /*30 min in epoch*/},
            (e, data) => {
              if (e) {
                return next(e);
              }
              else {
                // sendmail with link
                const link = req.protocol + '://' + req.get('host') + '/admin-reset/' + token;
                mailer.forgotPassword(usr.name, link, usr.email)
                  .then(result => {
                    res.send(true);
                  }).catch(err => {
                  return next(err);
                });
              }
            }
          )
        });
      } else {
        res.send(false);
      }
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/checkResetToken').post((req,res,next) => {
  let token = req.body.token;
  User.findOne({'forgotPassword.token': token, 'forgotPassword.expiry': { $gt: Date.now() } }, function(err, user) {
    if(err) {
      return next(err);
    } else if (user) {
      res.send(true);
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/updateForgotPassword').post((req, res, next) => {
  let saltRounds = 10;
  let user = req.body;
  bcrypt.hash(user.passwordHash, saltRounds, (er, hash) => {
    if(er) {
      return next(er);
    } else {
      User.findOneAndUpdate(
        {'forgotPassword.token': req.body.token},
        {
          $unset: {'forgotPassword.token': "", 'forgotPassword.expiry': ""},
          $set: {passwordHash: hash}
        },
        (err, user) => {
          if(err) {
            return(err);
          } else if (user) {
            res.send(user);
          }
          else {
            res.send(false);
          }
        });
    }
  });
});
// ============================ ADMIN ROUTES ===========================
// ============================ MILESTONE LIST ROUTES  =================
userRoutes.route('/addList').post((req, res, next) => {
  let list = req.body;
  delete list._id;
  list.milestones = [];
  List.create(list, (err, resList) => {
    if (err) return next(err);
    else if (resList) {
      User.findByIdAndUpdate(resList.updatedBy, {$push: {milestoneLists: resList._id}}, (er, userRes) => {
        if(er) return next(er);
        else res.json(resList);
    });
  } else {
    res.send(false);
  }
  });
});
userRoutes.route('/addMilestones').post((req, res, next) => {
  let milestones = req.body.milestones;
  milestones.forEach(m => {delete m._id});
  let listID = req.body.listID;
  Milestone.insertMany(milestones, (err, resMs) => {
    if (err) return next(err);
    else if (resMs) {
      let mIds = resMs.map((id) => {return id['_id']});
      List.findByIdAndUpdate(listID, {$push: {milestones:{$each: mIds}}}, {new: true}).populate('milestones').exec((er, mRes) => {
        if (er) return next(er);
        else res.json(mRes);
      });
    }else {
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
      return next(err);
    } else if (resM) {
      let mId = resM._id;
      List.findByIdAndUpdate(listID, {$push: {milestones: mId}}, {new: true}).populate('milestones').exec((er, mRes) => {
        if (er) {
          return next(er);
        } else if(mRes) {
          res.json(mRes);
        } else {
          res.send(false);
        }
      });
    }else {
      res.send(false);
    }
  })
});
userRoutes.route('/deleteMilestone').post((req, res, next) => {
  const id = req.body.id;
  const listID = req.body.listID;
  Milestone.findByIdAndRemove(id, (err, result) => {
    if (err) {
      return next(err);
    } else if (result) {
      List.findByIdAndUpdate(listID, {$pull: {milestones: id}}, (er, result1) =>{
        if(er) {
          return next(err);
        } else if(result1) {
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
      return next(err);
    }
    else if (result) {
      res.send(true);
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/list').get((req, res, next) => {
  // get all milestone Lists
  // TODO: get lists from specific user and not just all lists in DB
  List.find().populate({path: 'milestones', options: {sort: {'number': 1}}}).exec((err, lists) => {
    if (err) return next(err);
    else if (lists) {
      res.json(lists);
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/lists/:id').get((req, res, next) => {
  // get all milestone Lists
  const id = req.params.id;
  List.findById(id).populate('milestones').exec((err, list) => {
    if(err) return next(err);
    else if (list) {
      res.json(list);
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/deleteList').post((req, res, next) => {
  const id = req.body.lid;
  const uid = req.body.uid;
  List.findByIdAndRemove(id, (err, result) => {
    if (err) {
      return next(err);
    } else if (result) {
      Milestone.deleteMany({_id: {$in: result.milestones}}, (er, result1) =>{
        if(er) {
          return next(er);
        } else if(result1) {
          User.findByIdAndUpdate(uid, {$pull: {milestoneLists: id}}, (e, result2) => {
            if (e) {
              return next(err);
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
      return next(err);
    } else if (result) {
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
      return next(err);
    } else if(resP) {
      User.findByIdAndUpdate(uid, {properties: resP._id}, (er, resU) => {
        if(er) {
          return next(er);
        } else if(resU) {
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
      return next(err);
    } else if (user) {
      res.json(user.properties);
    }
  });
});
userRoutes.route('/hasProperties/:id').get((req, res, next) => {
  // get user's properties
  const id = req.params.id;
  User.findById(id, 'properties', (err, user) => {
    if(err) {
      return next(err);
    } else if (user.properties) {
      res.json(true);
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/updateProperties').post((req, res, next) => {
  const prop = req.body.properties;
  if (!prop.propertyTypes) {
    delete prop.propertyTypes;
  }
  if (!prop.deedsOffices) {
    delete prop.deedsOffices;
  }
  if (!prop.propertyTypes) {
    delete prop.propertyTypes;
  }
  if (!prop.actionTypes) {
    delete prop.actionTypes;
  }
  if (!prop.commentMailFooter) {
    delete prop.commentMailFooter;
  }
  const uid = req.body.uid;
  User.findById(uid, 'properties', (err, user) => {
    if(err) {
      return next(err);
    }
    if (user) {
      Properties.findByIdAndUpdate(user.properties, prop, {new: true}, (er, pRes) => {
        if(er) {
          return next(er);
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
/*userRoutes.route('/addOneActionProperty').post((req, res, next) => {
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
});*/
userRoutes.route('/addOneDeedsOffice').post((req, res, next) => {
  const d = req.body.deedsOffice;
  const uid = req.body.uid;
  User.findById(uid, 'properties', (err, user) => {
    if(err) {
      return next(err);
    } else if (user.properties) {
      Properties.findByIdAndUpdate(user.properties, {
        $push: {deedsOffices: d}
      }, (er, pRes) => {
        if(er) {
          return next(er);
        }
        if(pRes) {
          res.send(true);
        }else {
          res.send(false);
        }
      })
    }else if(user && !user.properties) {
      const properties = new Properties();
      properties.deedsOffices = [];
      properties.deedsOffices.push(d);
      properties.save((error, prop) => {
        if (error) {
          return next(error);
        }
        if (prop) {
          User.findByIdAndUpdate(uid, {properties: prop._id}, (er, result) => {
            if(er) {
              return next(er);
            }
            if (result) {
              res.send(true);
            }else {
              res.send(false);
            }
          });
        } else {
          res.send(false);
        }
      });
    }else {
      res.send(false);
    }
  });
});
// ============================ ADMIN PROPERTIES ROUTES  ===============
// ============================ CONTACTS ROUTES  =======================
userRoutes.route('/addContact').post((req, res, next) => {
  let contact = req.body.contact;
  if (contact.email === "" || contact.email === null) {
    delete contact.email;
  } else {
    contact.email = contact.email.toLowerCase();
  }
  if (contact.cell === "" || contact.cell === null) {
    delete contact.cell;
  }
  contact.verified = false;
  let uid = req.body.uid;
  contact.passwordHash = Math.random().toString(36).substring(10);
  let saltRounds = 10;
  bcrypt.hash(contact.passwordHash, saltRounds, (err, hash) => {
    // Store hash in your password DB.
    if (err) {
      return next(err);
    }
    contact.passwordHash = hash;
    Contact.create(contact, (er, ct) => {
      if (er) {
        return next(er);
      }
      if (ct) {
        User.findByIdAndUpdate(uid, {$push: {contacts: ct._id}}, (e, usr) => {
          if (e) {
            return next(e);
          }
          if (usr) {
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
  User.findById(id, 'contacts').populate('contacts').maxTimeMS(2000).exec((err, user) => {
    if(err) {
      return next(err);
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
      return next(err);
    }
    else if (result) {
      User.findByIdAndUpdate(uid, {$pull: {contacts: cid}}, (er, result1) => {
        if (er) {
          return next(er);
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
  if (ct.email === "" || ct.email === null) {
    delete ct.email;
  } else {
    ct.email = ct.email.toLowerCase();
  }
  if (ct.cell === "" || ct.cell === null) {
    delete ct.cell;
  }
  async.waterfall([
      (cb) => {
        Contact.findByIdAndUpdate(ct._id, ct, {new: true}, (er, ctRes) => {
          if(er) {
            cb(er)
          }
          if(ctRes) {
            cb(null, ctRes)
          } else {
            res.send(false);
          }
        })
      },
      (ctRes, cb) => {
        if (!ct.email) {
          Contact.findByIdAndUpdate(ct._id, {$unset: {email: ""}}, {new: true}, (e, result) => {
            if (e) {
              cb(e);
            }else {
              cb(null, result);
            }
          });
        } else {
          cb(null, ctRes);
        }
      },
      (ctRes, cb) => {
        if (!ct.cell) {
          Contact.findByIdAndUpdate(ct._id, {$unset: {cell: ""}}, {new: true}, (e, result) => {
            if (e) cb(e);
            else cb(null, result);
          });
        } else {
          cb(null, ctRes);
        }
      }
    ],
    (err, result) => {
      if (err) {
        return next(err);
      } else if(result) {
        res.send(result);
      } else {
        res.send(false);
      }
    });
});
userRoutes.route('/contacts/:uid/:search').get((req, res, next) => {
  // get user's contacts
  const uid = req.params.uid;
  const searchTerm = req.params.search;
  User.findById(uid, 'contacts').populate('contacts', 'name email cell type surname').exec((err, user) => {
    if(err) {
      return next(err);
    }
    if (user) {
      res.send(find(user.contacts, searchTerm));
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/contact').post((req, res, next) => {
  // get user's contacts
  const uid = req.body.uid;
  let email = req.body.email;
  email = email.toLowerCase();
  User.findById(uid, 'contacts').populate('contacts', 'name email cell type').exec((err, user) => {
    if(err) {
      return next(err);
    }else if (user) {
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
userRoutes.route('/contact/:id').get((req, res, next) => {
  const id = req.params.id;
  Contact.findById(id).exec((err, contact) => {
    if(err) {
      return next(err);
    }else if (contact) {
      res.json(contact);
    }else {
      res.send(false);
    }
  });
});
userRoutes.route('/registerContact').post((req, res, next) => {
  const contact = req.body;
  let saltRounds = 10;
  bcrypt.hash(contact.passwordHash, saltRounds, (err, hash) => {
    // Store hash in your password DB.
    if (err) {
      return next(err);
    } else {
      Contact.findByIdAndUpdate(contact._id, {$set : {verified: true, passwordHash: hash}}, (er, resCt) => {
        if (er) {
          return next(err);
        } else if (resCt) {
          res.json(resCt);
        } else {
          console.log('unsuccessful registration: \n' + resCt);
          res.send(false);
        }
      })
    }
  });
});
userRoutes.route('/loginContact').post((req, res, next) => {
  let ct = req.body;
  Contact.findById(ct._id, '_id name passwordHash email', (err, resCt) => {
    if (err) {
      return next(err);
    } else if (resCt) {
      resCt = resCt.toObject();
      bcrypt.compare(ct.password, resCt.passwordHash, (er, pwMatch) => {
        if (er) {
          return next(er);
        } else if(pwMatch) {
          delete resCt.passwordHash;
          res.send(resCt);
        }else {
          res.send(false);
        }
      });
    }
  });
});
userRoutes.route('/checkEmailContact').post((req ,res, next) => {
  let email = req.body.email;
  Contact.findOne({email : email}, (err, usr) => {
    if (err) {
      return next(err);
    } else if (usr) {
      if (usr.verified) {
        crypto.randomBytes(20, (er, buf) => {
          if (er) {
            return next(er);
          } else {
            let token = buf.toString('hex');
            Contact.update({_id: usr._id},
              {'forgotPassword.token': token, 'forgotPassword.expiry': Date.now() + 1800000 /*30 min in epoch*/},
              (e, data) => {
                if (e) {
                  return next(e);
                }
                else {
                  // sendmail with link
                  const link = req.protocol + '://' + req.get('host') + '/contact-reset/' + token;
                  mailer.forgotPassword(usr.title + ' ' + usr.surname, link, usr.email)
                    .then(result => {
                      res.send(true);
                    }).catch(err => {
                    return next(err);
                  });
                }
              }
            )
          }
        });
      } else {
        res.send(false);
      }
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/checkResetTokenContact').post((req,res,next) => {
  let token = req.body.token;
  Contact.findOne({'forgotPassword.token': token, 'forgotPassword.expiry': { $gt: Date.now() } }, function(err, user) {
    if(err) {
      return next(err);
    } else if (user) {
      res.send(true);
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/updateForgotPasswordContact').post((req, res, next) => {
  let saltRounds = 10;
  let user = req.body;
  bcrypt.hash(user.passwordHash, saltRounds, (er, hash) => {
    if(er) {
      return next(er);
    }else {
      Contact.findOneAndUpdate(
        {'forgotPassword.token': req.body.token},
        {
          $unset: {'forgotPassword.token': "", 'forgotPassword.expiry': ""},
          $set: {passwordHash: hash}
        },
        (err, user) => {
          if(err) {
            return next(err);
          } else if (user) {
            res.send(user);
          }
          else {
            res.send(false);
          }
        });
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
  file.archived = false;
  async.waterfall([
    (callback) => { // first method: Get milestone list associated to file and build new file with milestones array
      List.findById(file.milestoneList, 'milestones')
        .populate({path: 'milestones', select: {'_id': 1}, options: {sort: {'number': 1}}})
        .exec((error, list) => {
        if (error) {
          callback(error);
        }else if (list) {
          let newList = new Object();
          newList.milestones = list.milestones.map(ms => {
            return new Object({_id: ms, completed: false, updatedBy: uid, updatedAt: new Date()})
          });
          newList._id = list._id;
          file.milestoneList = newList;
          callback(null, file);
        } else {
          console.log('unsuccessful creation: \n');
          res.send(false);
        }
      });
    },
    (file, callback) => { // Second method: Insert File
      File.create(file, (error, f) => {
        if (error) {
          callback(error);
        }else if (f) {
          callback(null, f);
        } else {
          console.log('unsuccessful creation: \n');
          res.send(false);
        }
      })
    },
    (file, callback) => { // Third method: Update user files array with new file _id
      User.findById(uid).exec((er, me) => {
        if (er) {
          callback(error);
        } else if(me.companyAdmin) {
          User.findByIdAndUpdate(me.companyAdmin, {$push: {files: file._id}}, (error, usr) => {
            if (error) {
              callback(error);
            } else if (usr) {
              callback(null, file, me);
            }
          });
        } else {
          User.findByIdAndUpdate(uid, {$push: {files: file._id}}, (error, usr) => {
            if (error) {
              callback(error);
            }else if (usr) {
              callback(null, file, usr);
            }
          });
        }
      });
    },
    (file, usr, callback) => { // get contacts and send out emails
      File.findById(file._id).populate('contacts').populate('milestoneList._id', 'title').exec((error, f) => {
        if(error) callback(error);
        else {
          const host = req.protocol + '://' + req.get('host');
          const fileURL = host  + '/file/' + encodeURI(file._id);
          const loginUrl = host + '/login/' + encodeURI(file._id);
          f.contacts.forEach(ct => {
            const registerURL = loginUrl + '/' + encodeURI(ct._id);
            if (ct.email) {
              mailer.contactAddedToFile(ct.email, ct.title + ' ' + ct.surname, f.milestoneList._id.title, file.fileRef, registerURL);
            }
          });
          mailer.adminFileCreated(usr.email, host + '/admin-home', file.fileRef);
          callback(null, file);
        }
      });
    }
  ], (err, result) => {
    if (err) {
      return next(err);
    }else if (result) {
      res.send(result);
    }
  });
});
userRoutes.route('/updateFile').post((req, res, next) => {
  const f = req.body.file;
  const uid = req.body.uid;
  f.updateBy = uid;
  f.updatedAt = new Date();
  delete f.milestoneList;
  File.findByIdAndUpdate(f._id, f, {new: true}, (er, fRes) => {
    if(er) {
      return next(er);
    } else if(fRes) {
      if (f.refUser && f.contacts) {
        File.findByIdAndUpdate(f._id, {$set: {contacts: f.contacts, refUser: f.refUser}}, {new: true},  (e, newFileRes) => {
          if(e) return next(e);
          else if (newFileRes) {
            res.send(newFileRes);
          } else {
            res.send(false);
          }
        });
      } else {
        res.send(fRes);
      }
    } else {
      res.end(false);
    }
  })
});
userRoutes.route('/files/:id').get((req, res, next) => {
  // get user's Files
  const id = req.params.id;
  User.findById(id, 'files').exec((err, user) => {
    if(err) {
      return next(err);
    } else if (user) {
      File.find({_id: {$in: user.files}})
        .populate('milestoneList.milestones._id')
        .populate('milestoneList._id', 'title')
        .populate('milestoneList.milestones.updatedBy', 'name')
        .populate('contacts', 'name surname title email cell type')
        .populate('milestoneList.milestones.comments.user', 'name')
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .populate('refUser', 'name')
        .sort({createdAt: -1})
        .exec((er, files) => {
        if (er) {
          return next(er);
        } else if (files) {
          files.forEach(f => {
            f.milestoneList.milestones.sort((a, b) => {
              return a._id.number - b._id.number;
            });
          });
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
userRoutes.route('/file/:id').get((req, res, next) => {
  const id = req.params.id;
  File.findById(id)
    .populate('milestoneList.milestones._id')
    .populate('milestoneList._id', 'title')
    .populate('milestoneList.milestones.updatedBy', 'name')
    .populate('contacts')
    .populate('refUser', 'name surname cell email')
    .populate('milestoneList.milestones.comments.user', 'name')
    .populate({
      path: 'createdBy',
      select: {'company': 1, 'name': 1, 'surname': 1, 'email': 1},
      populate: {
        path: 'companyAdmin',
        select: {'company': 1, 'name': 1, 'surname': 1, 'email': 1}
      }})
    .populate('updatedBy', 'name')
    .exec((error, file) => {
    if(error) {
      return next(error);
    } else if(file) {
      file.milestoneList.milestones = file.milestoneList.milestones.filter(m => m.completed === true);
      file.milestoneList.milestones.sort((a, b) => {
        return a._id.number - b._id.number;
      });
      res.send(file);
    }
  });
});
userRoutes.route('/fileRef/:id').get((req, res, next) => {
  const id = req.params.id;
  File.findById(id, 'fileRef').exec((error, file) => {
    if(error) {
      return next(error);
    } else if(file) {
      res.send(file);
    }
  });
});
userRoutes.route('/completeMilestone').post((req, res, next) => {
  let fileID = req.body.fileID;
  let milestoneID = req.body.milestoneID;
  let uid = req.body.uid; // can be top level or secretary
  let notiProps = req.body.notiProps;
  File.findOneAndUpdate(
    {_id: fileID, 'milestoneList.milestones._id': milestoneID},
    {$set: {
        'milestoneList.milestones.$.completed': true,
        'milestoneList.milestones.$.updatedBy': uid,
        'milestoneList.milestones.$.updatedAt': new Date(),
         updatedBy: uid
      }
    }, {new: true})
    .populate('refUser', 'name email')
    .exec((err, newFile) => {
      if (err) {
        return next(err);
      }else if (newFile) {
        async.parallel({
          contacts: (callback) => {
            Contact.find({_id: {$in: newFile.contacts}}).exec((er, cts) => {
              callback(er, cts);
            });
          },
          adminUser: (callback) => {
            User.findById(uid, (er, user) => { // get me
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
            return next(er);
          } else if (callback.contacts && callback.adminUser && callback.milestone) {
            let emailMessage = callback.milestone.emailMessage;
            let smsMessage = callback.milestone.smsMessage;
            const milestoneName = callback.milestone.name;
            if (notiProps) { // user chose notification preference on the front end
              if (notiProps.sendEmail) { // send email
                if (notiProps.emailContacts) { // contacts have been chosen for emails
                  notiProps.emailContacts.forEach(ct => {
                    const url = req.protocol + '://' + req.get('host') + '/login/' + encodeURI(fileID) + '/' + encodeURI(ct._id);
                    const email = ct.email;
                    // All fields that must replace placeholders in messages
                    const emailContext = {
                      deedsOffice: newFile.deedsOffice,
                      propertyDescription: newFile.propertyDescription,
                      myName: callback.adminUser.name,
                      contactName: ct.title + ' ' + ct.surname,
                      fileRef: newFile.fileRef,
                      secNames: newFile.refUser.map(s => s.name),
                      secEmails: newFile.refUser.map(s => s.email),
                      bank: newFile.bank
                    };
                    if (email) { // check if contact has email address
                      mailer.sendEmail(
                        email,
                        buildMessage(emailMessage, emailContext),
                        url,
                        milestoneName + ' milestone has been completed.'
                      );
                    }
                  });
                }
              }
              if (notiProps.sendSMS) { // send sms
                if (notiProps.smsContacts) { // contacts have been chosen for smss
                  notiProps.smsContacts.forEach(ct => {
                    const smsContext = {
                      deedsOffice: newFile.deedsOffice,
                      propertyDescription: newFile.propertyDescription,
                      myName: callback.adminUser.name,
                      contactName: ct.title + ' ' + ct.surname,
                      fileRef: newFile.fileRef,
                      secNames: newFile.refUser.map(s => s.name),
                      secEmails: newFile.refUser.map(s => s.email),
                      bank: newFile.bank
                    };
                    if(ct.cell) {
                      smser.send(
                        ct.cell,
                        buildMessage(smsMessage, smsContext)
                      ).then(res => {}, (error) => {
                        console.log(error);
                        res.send(false);
                      });
                    }
                  });
                }
              }
            } else { // user didn't choose notification preference on front end, use default
              callback.contacts.forEach(ct => {
                const url = req.protocol + '://' + req.get('host') + '/login/' + encodeURI(fileID) + '/' + encodeURI(ct._id);
                const email = ct.email;
                // All fields that must replace placeholders in messages
                const emailContext = {
                  deedsOffice: newFile.deedsOffice,
                  propertyDescription: newFile.propertyDescription,
                  myName: callback.adminUser.name,
                  contactName: ct.title + ' ' + ct.surname,
                  fileRef: newFile.fileRef,
                  secNames: newFile.refUser.map(s => s.name),
                  secEmails: newFile.refUser.map(s => s.email),
                  bank: newFile.bank
                };
                if (callback.milestone.sendEmail) { // send email
                  if (email) {
                    mailer.sendEmail(email, buildMessage(emailMessage, emailContext), url, milestoneName + ' milestone has been completed.');
                  }
                }
                if (callback.milestone.sendSMS) { // send sms
                  if (ct.cell) {
                    smser.send(ct.cell, buildMessage(smsMessage, emailContext))
                      .then(res => {}, (error) => {
                        console.log(error);
                        res.send(false);
                      });
                  }
                }
                // check if always ask for noti props is activated
              });
            }
            res.send({
              message: 'Milestone successfully marked as complete' + (callback.milestone.sendEmail || callback.milestone.sendSMS ? ', and all parties notified.' : '.')
            });
          } else {
            res.end(false);
          }
        });
      } else {
        res.end(false);
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
  let sendNoti = req.body.sendNoti;
  let emailContacts = req.body.emailContacts;
  let smsContacts = req.body.smsContacts;
  File.findOneAndUpdate(
    {_id: fileID, 'milestoneList.milestones._id': milestoneID},
    { $push: {'milestoneList.milestones.$.comments': comment},
      updatedBy: comment.user,
      updatedAt: new Date(),
      'milestoneList.milestones.$.updatedBy': comment.user,
      'milestoneList.milestones.$.updatedAty': new Date()
    },
    {fields: 'milestoneList.milestones.$.comments propertyDescription fileRef refUser deedsOffice bank'})
    .populate('milestoneList.milestones.comments.user', 'name')
    .populate('milestoneList.milestones._id', 'name')
    .populate('refUser', 'email name')
    .exec((err, result) => {
    if (err) {
      return next(err);
    }else if (result) {
        User.findById(comment.user, 'name email')
          .populate({
            path: 'companyAdmin',
            select: {'properties': 1},
            populate: {path: 'properties'}
          })
          .populate('properties')
          .exec((er, user) => {
            if(er) return next(er);
            else {
              comment.user = user;
              let commentFooter = user.properties ? user.properties.commentMailFooter : user.companyAdmin.properties.commentMailFooter;
              if (sendNoti.email && emailContacts.length > 0) { // if send email true and contacts selected
                emailContacts.forEach(ct => {
                  if (ct.email) {
                    const footerContext = {
                      deedsOffice: result.deedsOffice,
                      propertyDescription: result.propertyDescription,
                      myName: user.name,
                      contactName: ct.title + ' ' + ct.surname,
                      fileRef: result.fileRef,
                      secNames: result.refUser.map(s => s.name),
                      secEmails: result.refUser.map(s => s.email),
                      bank: result.bank
                    };
                    const url = req.protocol + '://' + req.get('host') + '/login/' + encodeURI(fileID) + '/' + encodeURI(ct._id);
                    mailer.commentMade(user.name, ct.email, comment.comment, result.propertyDescription, result.milestoneList.milestones[0]._id.name, url, buildMessage(commentFooter, footerContext));
                  }
                });
              }
              if (sendNoti.sms && smsContacts.length > 0) {
                smsContacts.forEach(ct => {
                  if (ct.cell) {
                    const footerContext = {
                      deedsOffice: result.deedsOffice,
                      propertyDescription: result.propertyDescription,
                      myName: user.name,
                      contactName: ct.title + ' ' + ct.surname,
                      fileRef: result.fileRef,
                      secNames: result.refUser.map(s => s.name),
                      secEmails: result.refUser.map(s => s.email),
                      bank: result.bank
                    };
                    const url = req.protocol + '://' + req.get('host') + '/login/' + encodeURI(fileID) + '/' + encodeURI(ct._id);
                    smser.commentMade(ct.cell, comment.comment, user.name, result.propertyDescription, result.milestoneList.milestones[0]._id.name, buildMessage(commentFooter, footerContext));
                  }
                });
              }
              res.send(comment);
            }
          });
      } else {
        res.end(false);
      }
  })
});
// ============================ FILE ROUTES  ===========================
// ============================ ENTITY ROUTES  =========================
userRoutes.route('/addEntity').post((req, res, next) => {
  let entity = req.body.entity;
  Entity.create(entity, (err, e) => {
    if (err) return next(err);
    else {
      res.send(e);
    }
  })
});
module.exports = userRoutes;

function find(items, text) {
  text = text.toLowerCase();
  text = text.split(' ');
  return items.filter((item) => {
    return text.every((el) => {
      if (!item.email) {
        item.email = '';
      }
      if (!item.cell) {
        item.cell = '';
      }
      return item.name.toLowerCase().indexOf(el) > -1 || item.cell.indexOf(el) > -1 || item.email.toLowerCase().indexOf(el) > -1 || item.type.toLowerCase().indexOf(el) > -1;
    });
  });
}
function buildMessage(body, context) {
  let resultMessage = body.split('*deeds_office*').join(context.deedsOffice);
  resultMessage = resultMessage.split('*property_description*').join(context.propertyDescription);
  resultMessage = resultMessage.split('*my_name*').join(context.myName);
  resultMessage = resultMessage.split('*contact_name*').join(context.contactName);
  resultMessage = resultMessage.split('*sec_names*').join(context.secNames.join(' / '));
  resultMessage = resultMessage.split('*sec_emails*').join(context.secEmails.join(' / '));
  resultMessage = resultMessage.split('*file_ref*').join(context.fileRef);
  if (context.bank) {
    resultMessage = resultMessage.split('*bank*').join(context.bank);
  }
  return resultMessage;
}
