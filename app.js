const express = require('express'),
      app = express(),
      bodyParser = require('body-parser');

const {User} = require('./models/user');

const todoRoute = require('./routes/todos'),
      userRoute = require('./routes/users');
// parse application/x-www-form-urlencoded. use with webapps
// app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json. use with api
app.use(bodyParser.json());

app.use('/todo', todoRoute);
app.use('/user', userRoute);

module.exports = app;
