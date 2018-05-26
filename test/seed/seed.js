const { ObjectId } = require('mongoose').Types,
      jwt = require('jsonwebtoken');

const { Todo } = require('../../models/todo'),
      { User } = require('../../models/user');

const userOneId = new ObjectId,
      userTwoId = new ObjectId;
const user_mock = [{
  _id: userOneId,
  username: "John",
  email: "john@example.com",
  password: 'passjohn123',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'owee98qu9816JH#@asfs!sojfsoad').toString()
  }]
},
{
  _id: userTwoId,
  username: "Bob",
  email: "bob@example.com",
  password: "passbob123",
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, 'owee98qu9816JH#@asfs!sojfsoad').toString()
  }]
}];

const todo_mock = [{
  _id: new ObjectId,
  content: "Learn Nodejs",
  _creator: userOneId
  },
  {
    _id: new ObjectId,
    content: "Learn Python",
    complete: false,
    completeAt: 1234,
    _creator: userTwoId
  }];

const populateTodo = (done) => {
    Todo.remove({}).then(() => {
      return Todo.insertMany(todo_mock);
    }).then(() => done());
};

const populateUser = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(user_mock[0]).save();
    let userTwo = new User(user_mock[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = {todo_mock, populateTodo, user_mock, populateUser};
