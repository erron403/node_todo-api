const express = require('express'),
      router = express.Router(),
      _ = require('lodash');

const {mongoose, idValidator} = require('../db/mongoose'),
        {Todo} = require('../models/todo');


router.post('/', (req, res) => {
  let content = req.body.content;
  let complete = req.body.complete;
  let completeAt = req.body.completeAt;

  let newTodo = new Todo({content, complete, completeAt});
  newTodo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

router.get('/', (req, res) => {
  Todo.find().then((todo) => {
    res.send({todos: todo});
  }, (err) => {
    res.status(400).send(e);
  });
});

router.get('/:id', (req, res) => {
    let id = req.params.id;

    if (!idValidator(id)){
      return res.status(404).send({message: "Invalid ID"});
    }

    Todo.findById(id).then((todo) => {
      if (!todo){
         return res.status(404).send({message: "todo not exists"});
      }
      return res.send({todo});
    });
});

router.delete('/:id', (req, res) => {
    let id = req.params.id

    if (!idValidator(id)){
      return res.status(404).send({message: "Invalid ID"});
    }

    Todo.findByIdAndRemove(id).then((todo) => {
       if (!todo){
         return res.status(404).send({message: "todo not exists"});
       }
       return res.send({message: "Deleted Successfully."});
    }).catch((e) => res.status(400).send(e));
});

router.patch('/:id', (req, res) => {
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

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo){
          return res.status(404).send({message: "todo not exists"});
        }

        return res.send({todo});
    }).catch((e) => {
        res.status(400).send(e);
    })
});

module.exports = router;
