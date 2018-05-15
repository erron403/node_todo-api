const {mongoose, idValidator} = require('../db/mongoose');

const {Todo} = require('../models/todo');

const u_id = '5af66a8b76df787008cc9a1d'

// check for vaild id that 12 bytes
if (!idValidator(u_id)){
  return console.log("not valid id");
}

Todo.findById(u_id).then((todo) => {
  if (!todo){
    return console.log("Id not found");
  }
  console.log("todo by Id", todo);
}, (e) => {
  console.log('Id not exists');
})
