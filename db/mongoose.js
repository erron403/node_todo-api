const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp').then(() => {}, (err) => {
  console.log('unable to connect.');
});

const idValidator = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
}
module.exports = {mongoose, idValidator};
