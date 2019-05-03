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
const RequiredDocument = require('../models/reqDocuments');
const Document = require('../models/document');
const bcrypt = require('bcrypt');
const Mailer = require ('../mailer/mailer');
const Sms = require('../smsModule/sms');
const crypto = require('crypto');
const smser = new Sms();
const config = require('../../config/config');
const mailer = new Mailer(config.emailHost, config.emailPort, config.fromEmail, config.emailApiKey, config.emailUsername);
const async = require('async');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    let origName = file.originalname.substring(0, file.originalname.lastIndexOf("."));
    let ext = file.originalname.substring(file.originalname.lastIndexOf("."), file.originalname.length);
    cb(null, origName + Date.now() + ext)
  }
});
const upload = multer({storage: storage}).any();
const fs = require('fs');
const path = require('path');



// ============================ ADMIN ROUTES ===========================
userRoutes.route('/getSmsCredits').get((req, res, next) => {
  smser.getCredits()
    .then(response => {
      if (response) {
        res.send(response);
      }
    }).catch(err => {
      next(err);
  })
});
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
userRoutes.route('/contactNames').get((req, res, next) => {
  Contact.find({}, 'name surname', (err, contacts) => {
    if(err) next(err);
    else {
      res.send(contacts.map(c => {
        return {
          name: c.name + ' ' + c.surname,
          _id: c._id
        }
      }))
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
    if (err) {
      return next(err);
    } else if (contact) {
      res.json(contact);
    } else {
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
    (file, usr, callback) => { // add file to entity
      if (file.entity) {
        Entity.findByIdAndUpdate(file.entity, {$push: {files: file._id}}, (err, en) => {
          if(err) callback(err);
          else {
            callback(null, file, usr);
          }
        })
      }else {
        callback(null, file, usr);
      }
    },
    (file, usr, callback) => { // get contacts and send out emails
      File.findById(file._id)
        .populate('contacts')
        .populate('milestoneList._id', 'title')
        .populate({
          path: 'entity',
          select: 'contacts',
          populate: {
            path: 'contacts'
          }
        })
        .exec((error, f) => {
        if(error) callback(error);
        else {
          const host = req.protocol + '://' + req.get('host');
          if(f.entity) {
            const loginUrl = host + '/entity-login/' + encodeURI(f.entity._id);
            f.entity.contacts.forEach(ct => {
              const registerURL = loginUrl + '/' + encodeURI(ct._id);
              if (ct.email) {
                mailer.contactAddedToFile(ct.email, ct.title + ' ' + ct.surname, f.milestoneList._id.title, file.fileRef, registerURL);
              }
            });
          }
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
userRoutes.route('/files/:archived').get((req, res, next) => {
  // get all Files
  const arch = req.params.archived;
  File.find({archived: arch})
    .populate('milestoneList.milestones._id')
    .populate('milestoneList._id', 'title')
    .populate('milestoneList.milestones.updatedBy', 'name')
    .populate('contacts', 'name surname title email cell type')
    .populate('milestoneList.milestones.comments.user', 'name')
    .populate('summaries.user', 'name')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .populate('refUser', 'name')
    .populate({ // to display entity on file
      path: 'entity',
      populate: {
        path: 'contacts'
      }
    })
    .populate({ // to have file info when editing entity
      path: 'entity',
      populate: {
        path: 'files',
        select: 'fileRef'
      }
    })
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
    .populate('entity', 'name')
    .populate('summaries.user', 'name')
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
      } else if (newFile) {
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
          },
          requiredDocuments: (callback) => {
            RequiredDocument.find({milestone: milestoneID}, (er, rds) => {
              callback(er, rds);
            })
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
                    let requiredDocuments = null;
                    if (callback.requiredDocuments.length > 0) { // build required document upload links for buttons in email
                      requiredDocuments = [];
                      callback.requiredDocuments.forEach(rd => {
                        requiredDocuments.push({name: rd.name, link: req.protocol + '://' + req.get('host') + '/upload/' + encodeURI(fileID) + '/' + encodeURI(rd._id) + '/' + encodeURI(ct._id)});
                      });
                    }
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
                      mailer.milestoneAchieved(
                        email,
                        buildMessage(emailMessage, emailContext),
                        url,
                        milestoneName + ' milestone has been completed.',
                        requiredDocuments
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
                    mailer.milestoneAchieved(
                      email,
                      buildMessage(emailMessage, emailContext),
                      url,
                      milestoneName + ' milestone has been completed.',
                      requiredDocuments
                    );
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
userRoutes.route('/addSummary').post((req, res, next) => {
  let fileID = req.body.fileID;
  let summary = {
    user: req.body.uid,
    summary: req.body.summary,
    timestamp: new Date()
  };
  let sendNoti = req.body.sendNoti;
  let emailContacts = req.body.emailContacts;
  let smsContacts = req.body.smsContacts;
  File.findByIdAndUpdate(fileID,
    { $push: {summaries: summary}},
    {fields: 'propertyDescription fileRef refUser deedsOffice bank milestoneList'})
    .populate('summaries.user', 'name')
    .populate('milestoneList.milestones._id', 'name')
    .populate('refUser', 'email name')
    .populate('milestoneList._id', 'title')
    .exec((err, result) => {
    if (err) {
      return next(err);
    } else if (result) {
        User.findById(summary.user, 'name email')
          .populate({
            path: 'companyAdmin',
            select: {'properties': 1},
            populate: {path: 'properties'}
          })
          .populate('properties')
          .exec((er, user) => {
            if(er) return next(er);
            else {
              summary.user = user;
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
                    mailer.summaryAdded(user.name, ct.email, summary.summary, result.propertyDescription, result.fileRef, url, buildMessage(commentFooter, footerContext), result.milestoneList._id.title);
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
                    smser.summaryAdded(ct.cell, summary.summary, user.name, result.propertyDescription, result.fileRef, buildMessage(commentFooter, footerContext));
                  }
                });
              }
              res.send(summary);
            }
          });
      } else {
        res.end(false);
      }
  })
});
userRoutes.route('/allFileNames').get((req, res, next) => {
  File.find({entity: null}, 'fileRef', (err, files) => {
    if(err) next(err);
    else {
      res.send(files);
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
      if (entity.files.length > 0) {
        async.each(entity.files, (f, callback) => {
          File.findByIdAndUpdate(f, {entity: e._id}, (err, f) => {
            if (err) callback(err);
            else {
              callback();
            }
          })
        }, (err) => {
          if(err) next(err);
          else {
            Entity.populate(e, [
              {
                path: 'contacts',
                select: {'name': 1, 'surname': 1, 'type': 1}
              },
              {
                path: 'files',
                select: {'fileRef': 1, 'milestoneList._id': 1},
                populate: {
                  path: 'milestoneList._id',
                  select: {'title': 1}
                }
              }
            ], (err, entity) => {
              if(err) next(err);
              res.send(entity);
            });
          }
        });
      } else {
        Entity.populate(e, [
          {
            path: 'contacts',
            select: {'name': 1, 'surname': 1, 'type': 1}
          },
          {
            path: 'files',
            select: {'fileRef': 1, 'milestoneList._id': 1},
            populate: {
              path: 'milestoneList._id',
              select: {'title': 1}
            }
          }
        ], (err, entity) => {
          if(err) next(err);
          res.send(entity);
        });
      }
    }
  })
});
userRoutes.route('/entities').get((req, res, next) => {
  Entity.find({})
    .populate('contacts', 'name surname')
    .populate({
      path: 'files',
      select: {'fileRef': 1, 'milestoneList._id': 1},
      populate: {
        path: 'milestoneList._id',
        select: {'title': 1}
      }
    })
    .exec((err, e) => {
    if (err) return next(err);
    else {
      res.send(e);
    }
  })
});
userRoutes.route('/entity/:id').delete((req, res, next) => {
  const id = req.params.id;
  Entity.findByIdAndRemove(id, (err, result) => {
    if(err) next(err);
    else if(result) {
      async.each(result.files, (fId, callback) => {
        File.findByIdAndUpdate(fId, {entity: null}, (err, f) => {
          if(err) callback(err);
          else {
            callback(null);
          }
        })
      }, (err) => {
        if(err) next(err);
        else {
          res.send(true);
        }
      });
    } else {
      res.send(false);
    }
  })
});
userRoutes.route('/updateEntity').post((req, res, next) => {
  let entity = req.body.entity;
  Entity.findByIdAndUpdate(entity._id, entity, {new: true}, (err, e) => {
    if (err) return next(err);
    else {
      Entity.populate(e, [
        {
          path: 'contacts',
          select: {'name': 1, 'surname': 1, 'type': 1}
        },
        {
          path: 'files',
          select: {'fileRef': 1, 'milestoneList._id': 1},
          populate: {
            path: 'milestoneList._id',
            select: {'title': 1}
          }
        }
      ], (err, entity) => {
        if(err) next(err);
        res.send(entity);
      });
    }
  })
});
userRoutes.route('/entityExists').post((req, res, next) => {
  let entityName = req.body.name.toLowerCase().replace(/\s+/g, '');
  let existing = false;
  Entity.find({}, (err, entities) => {
    if(err) next(err);
    else if(entities) {
      entities.forEach(e => {
        let name = e.name.toLowerCase().replace(/\s+/g, '');
        if(name === entityName) {
          existing = true;
        }
      });
      res.send(existing);
    }
  });
});
userRoutes.route('/entityNames').get((req, res, next) => {
  Entity.find({}, 'name', (err, entities) => {
    if(err) next(err);
    else {
      res.send(entities);
    }
  });
});
userRoutes.route('/removeFileFromEntity').post((req, res, next) => {
  let eId = req.body.eId;
  let fId = req.body.fId;
  Entity.findByIdAndUpdate(eId, {$pull: {files: fId}})
    .exec((err, ent) => {
      if(err) next(err);
      else if(ent) {
        File.findByIdAndUpdate(fId, {entity: null})
          .exec((err, f) => {
            if(err) next(err);
            else if(f) {
              res.send(true);
            } else {
              res.send(false);
            }
          });
      } else {
        res.send(false);
      }
    })
});
userRoutes.route('/addFileToEntity').post((req, res, next) => {
  let eId = req.body.eId;
  let fId = req.body.fId;
  Entity.findByIdAndUpdate(eId, {$push: {files: fId}})
    .exec((err, ent) => {
      if(err) next(err);
      else if(ent) {
        File.findByIdAndUpdate(fId, {entity: eId})
          .exec((err, f) => {
            if(err) next(err);
            else if(f) {
              res.send(true);
            } else {
              res.send(false);
            }
          });
      } else {
        res.send(false);
      }
    })
});
userRoutes.route('/entity/:id').get((req, res, next) => {
  const id = req.params.id;
  Entity.findById(id).exec((err, entity) => {
    if (err) {
      return next(err);
    } else if (entity) {
      res.json(entity);
    } else {
      res.send(false);
    }
  });
});
userRoutes.route('/isEntity').post((req, res, next) => {
  let contact = req.body.contact;
  Entity.find({contacts: contact}, (err, entity) => {
    if(err) next(err);
    else if(entity.length > 0) {
      res.send(true);
    } else {
      res.send(false);
    }
  })
});
userRoutes.route('/getEntity').post((req, res, next) => {
  let eId = req.body.eId;
  Entity.findById(eId)
    .populate({
      path: 'files',
      populate: [{
        path: 'refUser',
        select: 'name surname cell email'
      }, {
        path: 'milestoneList._id',
        select: 'title'
      }, {
        path: 'milestoneList.milestones._id',
        select: 'name'
      }, {
        path: 'milestoneList.milestones.updatedBy',
        select: 'name'
      }, {
        path: 'milestoneList.milestones.updatedBy',
        select: 'name'
      }, {
        path: 'milestoneList.milestones.comments.user',
        select: 'name'
      },  {
        path: 'contacts',
        select: 'name surname cell email type'
      }, {
        path: 'summaries.user',
        select: 'name'
      }]
    })
    .populate('contacts', 'name surname cell email type')
    .exec((err, entity) => {
      if(err) next(err);
      else if(entity) {
        res.send(entity);
      } else {
        res.send(false);
      }
  })
});
// ============================ ENTITY ROUTES  =========================
// ============================ REQUIRED DOCUMENTS ROUTES  =============
userRoutes.route('/createRequiredDocument').post((req, res, next) => {
  let rd = req.body.rd;
  RequiredDocument.create(rd, (err, rd) => {
    if (err) return next(err);
    else {
      RequiredDocument.populate(rd, [{path: 'milestone', select: {'name': 1, 'number': 1}}], (err, requiredDoc) => {
        if(err) next(err);
        else {
          res.send(requiredDoc);
        }
      });
    }
  })
});
userRoutes.route('/requiredDocuments').get((req, res, next) => {
  RequiredDocument.find({})
    .populate('milestone', 'name number')
    .exec((err, rds) => {
      if (err) return next(err);
      else {
        res.send(rds);
      }
    })
});
userRoutes.route('/updateRequiredDocument').post((req, res, next) => {
  let rd = req.body.rd;
  RequiredDocument.findByIdAndUpdate(rd._id, rd, {new: true})
    .populate('milestone', 'name number')
    .exec((err, rds) => {
      if (err) return next(err);
      else {
        res.send(rds);
      }
    })
});
userRoutes.route('/requiredDocument/:id').delete((req, res, next) => {
  const id = req.params.id;
  RequiredDocument.findByIdAndRemove(id, (err, result) => {
    if(err) next(err);
    else {
      res.send(true);
    }
  })
});
userRoutes.route('/requiredDocument/:id').get((req, res, next) => {
  const id = req.params.id;
  RequiredDocument.findById(id)
    .populate('milestone', 'name')
    .exec((err, rd) => {
      if(err) next(err);
      else if(rd) {
        res.send(rd);
      } else {
        res.send(false);
      }
    });
});
// ============================ REQUIRED DOCUMENTS ROUTES  =============
// ============================ UPLOAD ROUTES  =========================
userRoutes.route('/upload').post(upload, (req, res, next) => {
  let contactID = req.body.contactID;
  let fileID = req.body.fileID;
  let reqDocID = req.body.requiredDocumentID;
  let name = req.files[0].filename;
  let path = req.files[0].path;
  let mime = req.files[0].mimetype;
  let document = {contactID: contactID, fileID: fileID, requiredDocumentID: reqDocID, name: name, path: path, mimeType: mime};
  Document.create(document, (err, rd) => {
    if(err) next(err);
    else {
      Document.findById(rd._id).populate({
        path: 'requiredDocumentID'
      }).populate({
        path: 'fileID',
        select: 'fileRef refUser',
        populate: {
          path: 'refUser',
          select: 'email'
        }
      }).populate({path: 'contactID', select: 'name surname'}).exec((er, rd) => {
        if(er) next(er);
        const link = req.protocol + '://' + req.get('host') + '/admin-home';
        async.each(rd.fileID.refUser, (u, cb) => {
          mailer.docUploaded(rd.contactID.name + ' ' + rd.contactID.surname, u.email, rd.requiredDocumentID.name, rd.fileID.fileRef, link)
            .then(() => {
              cb();
            }).catch(err => {
              if(err) cb(err);
          })
        }, (err) => {
          if(err) next(err);
          res.send(true);
        });
      });

    }
  })
});
userRoutes.route('/contactUploads/:id').get((req, res, next) => {
  const cid = req.params.id;
  Document.find({contactID: cid})
    .populate({
      path: 'milestoneID',
      select: 'name'
    })
    .populate({
      path: 'requiredDocumentID',
      select: 'name',
      populate: {
        path: 'milestone',
        select: 'name'
      }
    })
    .exec((err, uploads) => {
    if(err) next(err);
    else if(uploads.length > 0) {
      async.each(uploads, (u, cb) => {
        let fullPath = __dirname + '/../../' + u.path;
        fs.readFile(fullPath, (er, data) => {
          if(er) cb(er);
          else {
            if (u.mimeType.split('/')[0] === 'image') {
              u.path =  new Buffer(data).toString('base64');
            }
            cb();
          }
        });
      }, (er) => {
        if (er) next(er);
        else {
          res.send(uploads);
        }
      });
    } else {
      res.send(false);
    }
  })
});
userRoutes.route('/getAllUploads').get((req, res, next) => {
  Document.find({})
    .populate({
      path: 'milestoneID',
      select: 'name'
    })
    .populate({
      path: 'requiredDocumentID',
      select: 'name',
      populate: {
        path: 'milestone',
        select: 'name'
      }
    })
    .populate({
      path: 'contactID',
      select: 'name'
    })
    .exec((err, uploads) => {
      if(err) next(err);
      else if(uploads.length > 0) {
        async.each(uploads, (u, cb) => {
          let fullPath = __dirname + '/../../' + u.path;
          fs.readFile(fullPath, (er, data) => {
            if(er) cb(er);
            else {
              if (u.mimeType.split('/')[0] === 'image') {
                u.path =  new Buffer(data).toString('base64');
              }
              cb();
            }
          });
        }, (er) => {
          if (er) next(er);
          else {
            res.send(uploads);
          }
        });
      } else {
        res.send(false);
      }
    })
});
userRoutes.route('/download').post((req, res, next) => {
  let filePath = path.join(__dirname, '../../uploads/') + req.body.doc;
  res.sendFile(filePath);
});
// ============================ UPLOAD ROUTES  =========================


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
