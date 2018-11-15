const express = require('express');
const app = express();
const userRoutes = express.Router();
const User = require('../models/user');
const List = require('../models/milestoneList');
const Milestone = require('../models/milestone');
const Properties = require('../models/properties');
const bcrypt = require('bcrypt');

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
  const id = req.body._id;
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

module.exports = userRoutes;
