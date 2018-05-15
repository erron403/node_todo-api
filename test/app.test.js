const request = require('supertest');

const app = require('../app');
const {ObjectId} = require('mongoose').Types;
const {Todo} = require('../models/todo');
const {User} = require('../models/user');

const todo_mock = [{
  _id: new ObjectId,
  content: "Learn Nodejs"
  },
  {
    _id: new ObjectId,
    content: "Learn Python",
    complete: false,
    completeAt: 1234
  }
]
// beforeEach function help to run any function before start test.
// Here we remove all todo in db, Before run test.
beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todo_mock);
  }).then(() => done());
});

describe('POST /todo', () => {
  it('Should create a new todo', (done) => {
    let content = 'Test todo text';

    request(app)
        .post('/todo')
        .send({content})
        .expect(200)
        .expect((res) => {
          expect(res.body.content).toBe(content);
        })
        .end((err,res) => {
          if (err){
            return done(err)
          }

          Todo.find({content}).then((todo) => {
            expect(todo.length).toBe(1);
            expect(todo[0].content).toBe(content);
            done()
          }).catch((e) => done(e)); // catch statement require beacuese both fail, test still pass.
        });
  });

  it('Should not create invalid todo', (done) => {
    request(app)
      .post('/todo')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err){
          return done(err);
        }

        Todo.find().then((todo) => {
          expect(todo.length).toBe(2);
          done()
        }).catch((e) => done(e));
      });
  });
});

describe("GET /todo", () => {
  it("Should return all todo", (done) => {
    request(app)
        .get('/todo')
        .expect(200)
        .expect((res) => {
          expect(res.body.todos.length).toBe(2);
        })
        .end(done);
  });
});

describe("GET /todo/:id", () => {
  it("Should return doc", (done) => {
      request(app)
        .get(`/todo/${todo_mock[0]._id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.content).toBe(todo_mock[0].content);
        })
        .end(done);
  });

  it("Should return 404 if id is not valid", (done) => {
    request(app)
        .get('/todo/78y4e1872r')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe("Invalid ID");
        })
        .end(done);
  });

    it("Should return 404 if todo not exists", (done) => {
        let id = new ObjectId; // create new ObjectId
        request(app)
          .get(`/todo/${id}`)
          .expect(404)
          .expect((res) => {
            expect(res.body.message).toBe("todo not exists");
          })
          .end(done)
    });
});

describe("DELETE /todo/:id", () => {
  it('Should be return deleted message', (done) => {
     request(app)
        .delete(`/todo/${todo_mock[0]._id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Deleted Successfully.');
        })
        .end((err, res) => {
          if (err){
            return done(err);
          }

          Todo.findByIdAndRemove(todo_mock[0].id).then((todo) => {
              expect(404);
              expect(todo).toBeNull();
              done()
          }).catch((e) => done(e));
      });
  });

  it('Should be return 404 if id not valid', (done) => {
      request(app)
        .delete('/todo/12345678910')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe("Invalid ID");
        })
        .end(done);
  });

  it('Should be return 404 if id not exists', (done) => {
      let id = new ObjectId;
      request(app)
        .delete(`/todo/${id}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe("todo not exists");
        })
        .end(done);
  });
});

describe('#PATCH /todo/:id', () => {
    let content = "Some crtical task";
    let complete = true;

    it('Should return updated todo', (done) => {

       request(app)
          .patch(`/todo/${todo_mock[1]._id}`)
          .send({content, complete})
          .expect(200)
          .expect((res) => {
            expect(res.body.todo.content).toBe(content);
            expect(res.body.todo.complete).toBe(complete);
            expect(typeof res.body.todo.completeAt).toBe('number');
          })
          .end(done);
    });

    it("Should be clear completeAt when todo is not complete", (done) => {
        request(app)
            .patch(`/todo/${todo_mock[1]._id}`)
            .send({content, complete: false})
            .expect(200)
            .expect((res) => {
              expect(res.body.todo.content).toBe(content);
              expect(res.body.todo.complete).toBe(false);
              expect(res.body.todo.completeAt).toBeNull();
            })
            .end(done);
    });
});
