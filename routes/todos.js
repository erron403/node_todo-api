const express = require('express'),
      router = express.Router(),
      _ = require('lodash');

const {mongoose, idValidator} = require('../db/mongoose'),
      { authenticate } = require('../middleware/authenticate'),
        {Todo} = require('../models/todo');


// todo create route
router.post('/', authenticate, (req, res) => {
  let newTodo = new Todo({
    content: req.body.content,
    complete: req.body.complete,
    completeAt: req.body.completeAt,
    _creator: req.user._id
  });
  newTodo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// show all todo route
router.get('/', authenticate, (req, res) => {
  Todo.find({_creator: req.user._id}).then((todo) => {
    res.send({todos: todo});
  }, (err) => {
    res.status(400).send(e);
  });
});

// show specific todo route
router.get('/:id', authenticate, (req, res) => {
    let id = req.params.id;

    if (!idValidator(id)){
      return res.status(404).send({message: "Invalid ID"});
    }

    Todo.findOne({
      _id: id,
      _creator: req.user._id}).then((todo) => {
      if (!todo){
         return res.status(404).send({message: "todo not exists"});
      }
      return res.send({todo});
    });
});

router.delete('/:id', authenticate, (req, res) => {
    let id = req.params.id

    if (!idValidator(id)){
      return res.status(404).send({message: "Invalid ID"});
    }

    Todo.findOneAndRemove({
      _id: id,
      _creator: req.user._id}).then((todo) => {
       if (!todo){
         return res.status(404).send({message: "todo not exists"});
       }
       return res.send({message: "Deleted Successfully."});
    }).catch((e) => res.status(400).send(e));
});

router.patch('/:id', authenticate, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['content', 'complete'])

    if (!idValidator(id)){
      return res.status(404).send({message: "Invalid ID"});
    }

    if (_.isBoolean(body.complete) && body.complete) {
      body.completeAt = new Date().getTime();
    } else {
      body.complete = false;
      body.completeAt = null;
    }

    Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
        if (!todo){
          return res.status(404).send({message: "todo not exists"});
        }

        return res.send({todo});
    }).catch((e) => {
        res.status(400).send(e);
    })
});

module.exports = router;
