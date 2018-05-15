const mongoose = require('mongoose');

const dburl = process.env.MONGODB_URL || 'mongodb://localhost:27017/TodoApp';

mongoose.Promise = global.Promise;
mongoose.connect(dburl).then(() => {}, (err) => {
  console.log('unable to connect.');
});

const idValidator = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
}
module.exports = {mongoose, idValidator};
