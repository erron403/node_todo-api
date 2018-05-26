const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    content: {
      type: String,
      minlength: 1,
      trim: true,
      required: [true, 'content must be required!']
    },
    complete: {
      type: Boolean,
      default: false
    },
    completeAt: {
      type: Number,
      default: null,
    },
    _creator: {
      type: String,
      required: true
    }
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = {Todo};
