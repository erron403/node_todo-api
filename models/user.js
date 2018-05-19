const mongoose = require('mongoose'),
      validator = require('validator'),
      jwt = require('jsonwebtoken'),
      _ = require('lodash');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "must be required!"],
    trim: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,//(v) => {return /\w+@\w+.\w{2,9}/.test(v);}
       message: '{VALUE} must be email address!'
     },
     required: [true, "Email must be required!"]
   },
   password: {
     type: String,
     trim: true,
     minlength: 9,
     required: [true, "must be required!"]
   },
   tokens: [{
     access: {
       type: String,
       required: true
     },
     token: {
       type: String,
       required: true
     }
   }]
});

userSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject();

  return _.pick(userObject, ['_id', 'username', 'email']);
};

userSchema.methods.generateAuthToken = function() {
  let user = this;
  let access = 'auth';
  let token = jwt
              .sign({id: user._id.toHexString(), access}, 'owee98qu9816JH#@asfs!sojfsoad')
              .toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};

const User = mongoose.model('User', userSchema);

module.exports = {User};
