require('../config/config')
const request = require('supertest');
const app = require('../app');
const {ObjectId} = require('mongoose').Types;
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const {todo_mock, populateTodo, user_mock, populateUser} = require('./seed/seed');

// beforeEach function help to run any function before start test.
// Here we remove all todo in db, Before run test.
beforeEach(populateUser);
beforeEach(populateTodo);

describe('POST /todo', () => {
  it('Should create a new todo', (done) => {
    let content = 'Test todo text';

    request(app)
        .post('/todo')
        .set('x-auth', user_mock[0].tokens[0].token)
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
      .set('x-auth', user_mock[0].tokens[0].token)
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
        .set('x-auth', user_mock[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todos.length).toBe(1);
        })
        .end(done);
  });
});

describe("GET /todo/:id", () => {
  it("Should return doc", (done) => {
      request(app)
        .get(`/todo/${todo_mock[0]._id}`)
        .set('x-auth', user_mock[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.content).toBe(todo_mock[0].content);
        })
        .end(done);
  });

  it("Should not return doc created by other user", (done) => {
      request(app)
        .get(`/todo/${todo_mock[1]._id}`)
        .set('x-auth', user_mock[0].tokens[0].token)
        .expect(404)
        .end(done);
  });

  it("Should return 404 if id is not valid", (done) => {
    request(app)
        .get('/todo/78y4e1872r')
        .set('x-auth', user_mock[0].tokens[0].token)
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
          .set('x-auth', user_mock[0].tokens[0].token)
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
        .delete(`/todo/${todo_mock[1]._id}`)
        .set('x-auth', user_mock[1].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Deleted Successfully.');
        })
        .end((err, res) => {
          if (err){
            return done(err);
          }

          Todo.findById(todo_mock[1]._id).then((todo) => {
              expect(404);
              expect(todo).toBeFalsy();
              done()
          }).catch((e) => done(e));
      });
  });

  it('Should not be return deleted message if try to delete other user todo', (done) => {
     request(app)
        .delete(`/todo/${todo_mock[0]._id}`)
        .set('x-auth', user_mock[1].tokens[0].token)
        .expect(404)
        .end((err, res) => {
          if (err){
            return done(err);
          }
          Todo.findById(todo_mock[1]._id).then((todo) => {
              expect(todo).toBeTruthy();
              done()
          }).catch((e) => done(e));
      });
  });

  it('Should be return 404 if id not valid', (done) => {
      request(app)
        .delete('/todo/12345678910')
        .set('x-auth', user_mock[1].tokens[0].token)
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
        .set('x-auth', user_mock[1].tokens[0].token)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe("todo not exists");
        })
        .end(done);
  });
});

describe('PATCH /todo/:id', () => {
    let content = "Some crtical task";
    let complete = true;

    it('Should return updated todo', (done) => {

       request(app)
          .patch(`/todo/${todo_mock[0]._id}`)
          .set('x-auth', user_mock[0].tokens[0].token)
          .send({content, complete})
          .expect(200)
          .expect((res) => {
            expect(res.body.todo.content).toBe(content);
            expect(res.body.todo.complete).toBe(complete);
            expect(typeof res.body.todo.completeAt).toBe('number');
          })
          .end(done);
    });


        it('Should not be return updated todo if update other user todo', (done) => {

           request(app)
              .patch(`/todo/${todo_mock[0]._id}`)
              .set('x-auth', user_mock[1].tokens[0].token)
              .send({content, complete})
              .expect(404)
              .end(done);
      });

    it("Should be clear completeAt when todo is not complete", (done) => {
        request(app)
            .patch(`/todo/${todo_mock[0]._id}`)
            .set('x-auth', user_mock[0].tokens[0].token)
            .send({content, complete: false})
            .expect(200)
            .expect((res) => {
              expect(res.body.todo.content).toBe(content);
              expect(res.body.todo.complete).toBe(false);
              expect(res.body.todo.completeAt).toBeNull();
            })
            .end(done);
    });

  describe("GET /user/me", () => {
    it('it should be return user if authenticated', (done) => {
        request(app)
        .get('/user/me')
        .set('x-auth', user_mock[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(user_mock[0]._id.toHexString());
          expect(res.body.email).toBe(user_mock[0].email);
        })
        .end(done);
    });

    it('it should retun 401 if not authenticated', (done) => {
        request(app)
        .get('/user/me')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });
  });

  describe("POST /user", () => {
    it('it should create a user', (done) => {
      let user = {
        username: "Sam",
        email: "sam@example.com",
        password: "pass31234!"
      };

        request(app)
        .post('/user')
        .send(user)
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-auth']).toBeTruthy();
          expect(res.body._id).toBeTruthy();
          expect(res.body.email).toBe(user.email);
          expect(res.body.username).toBe(user.username);
        }).end((err) => {
          if (err){
            return done(err);
          }

          User.findOne({email: user.email}).then((user_fdb) => {
            expect(user_fdb).toBeTruthy();
            expect(user_fdb.password).not.toBe(user.password);
            done();
          }).catch((e) => done(e));
        });
    });

      it('it should return Validation error if request invalid', (done) => {
        let user = {
          username: "jam",
          email: "jam@example.com",
          password: "pass!"
          };

          request(app)
          .post('/user')
          .send(user)
          .expect(400)
          .end(done);
      });

       it('it should not create if email in use', (done) => {

         request(app)
         .post('/user')
         .send({
           username:user_mock[0].username,
           email: user_mock[0].email,
           password: 'passwd124!'
         })
         .expect(400)
         .end(done);
       });
  });

  describe('POST /user/login', () => {
    it('it should be return auth token if email and password correct', (done) => {
      request(app)
      .post('/user/login')
      .send({
        email: user_mock[1].email,
        password: user_mock[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      }).end((err, res) => {
        if (err){
          return done(err);
        }

        User.findById(user_mock[1]._id).then((user) => {
          expect(user.tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
    });

    it('should be return 400 if user credential not correct', (done) => {
        request(app)
        .post('/user/login')
        .send({
          email: user_mock[1].email,
          password: 'pass54321!'
        })
        .expect(400)
        .expect((res) => {
          expect(res.headers['x-auth']).toBeFalsy();
        })
        .end((err, res) => {
          if (err){
            return done(err);
          }

          User.findById(user_mock[1]._id).then((user) => {
            expect(user.tokens.length).toBe(1);
            done();
          }).catch((e) => done(e));
        });
    });
  });
});

describe("DELETE /user/me/token", () => {
  it('should remove auth token on logout', (done) => {
      request(app)
      .delete('/user/me/token')
      .set('x-auth', user_mock[0].tokens[0].token)
      .expect(200)
      .end((err) => {
        if (err){
          return done(err);
        }
        User.findById(user_mock[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
