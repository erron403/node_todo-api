const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "must be required!"],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => {
          return /\w+@\w+.\w{2,9}/.test(v);
      },
       message: '{VALUE} must be email address!'
     },
     required: [true, "Email must be required!"]
   }
});

const User = mongoose.model('User', userSchema);

module.exports = {User};
