const express = require('express'),
      router = express.Router(),
      _ = require('lodash');

const {mongoose, idValidator} = require('../db/mongoose'),
      {User} = require('../models/user');

router.post('/', (req, res) => {
  let body = _.pick(req.body, ['username', 'email', 'password']);
  let user = new User(body);


// when user created we generateAuthToken and then send user id and Email
// And token in header with name x-auth
// custom header name start with 'x-' here we define custom header 'x-auth'
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });

});

module.exports = router;