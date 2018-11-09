const express = require('express');
const app = express();
const userRoutes = express.Router();
const User = require('../models/user');
const List = require('../models/milestoneList');
const Milestone = require('../models/milestone');
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
  const milestones = list.milestones;
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
  let listID = req.body.listID;
  Milestone.insertMany(milestones, (err, resMs) => {
    if (err) return next(err);
    if (resMs) {
      let mIds = resMs.map((id) => {return id['_id']});
      console.log(mIds);
      List.findByIdAndUpdate(listID, {$push: {milestones:{$each: mIds}}}, (er, mRes) => {
        res.json(mRes);
      });
    }else {
      console.log('unsuccessful creation: \n' + result);
      res.send(false);
    }
  })
});

/*TODO: Insert One Milestone*/

module.exports = userRoutes;
