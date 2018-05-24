const mongoose = require('mongoose'),
      validator = require('validator'),
      jwt = require('jsonwebtoken'),
      _ = require('lodash'),
      bcrypt = require('bcryptjs');


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

// this is user instanse method for send only specific field in response
userSchema.methods.toJSON = function() {
  let user = this;
  // toObject method covert mongoose object to regular object.
  let userObject = user.toObject();

  return _.pick(userObject, ['_id', 'username', 'email']);
};

// this is user instanse method for generateAuthToken
userSchema.methods.generateAuthToken = function() {
  let user = this;
  let access = 'auth';
  let token = jwt
              .sign({_id: user._id, access},
              'owee98qu9816JH#@asfs!sojfsoad')
              .toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};

// User model method
userSchema.statics.findByToken = function(token) {
  let User = this;
  // store the jwt decode value and it not defined for catch error
  // if jwt throw error
  let decoded;

  try{
    decoded = jwt.verify(token, 'owee98qu9816JH#@asfs!sojfsoad');
  } catch (e){
    return Promise.reject();
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

// User model method for user login authentication
userSchema.statics.findByCred = function(email, password) {
  let User = this;

  return User.findOne({email}).then((user) => {
    if (!user){
      return Promise.reject();
    }

    return bcrypt.compare(password, user.password)
          .then((res) => {
              if (res){
                return user;
                } else {
                  return Promise.reject();
              }
          });
     });
};

// Middleware (also called pre and post hooks) are functions
// which are passed control during execution of asynchronous functions.
userSchema.pre('save', function(next) {
    let user = this;

    if (user.isModified('password')){
      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(user.password, salt, function(err, hash) {
            user.password = hash;
            next()
        });
      });
    } else {
      next()
    }
});

const User = mongoose.model('User', userSchema);

module.exports = {User};
