const express = require('express'),
      router = express.Router(),
      _ = require('lodash');

const {mongoose, idValidator} = require('../db/mongoose'),
      {authenticate} = require('../middleware/authenticate'),
      {User} = require('../models/user');

// user create
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

// User login
router.post('/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);

// find user by credential and send newly generated token
  User.findByCred(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

// test route
router.get('/me', authenticate, (req, res) => {
  res.send(req.user);
});

module.exports = router;
