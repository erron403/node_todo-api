let env = process.env.NODE_ENV || 'development';

if (env === 'development'){
  console.log("#### dev ####")
  process.env.PORT = 3000;
  process.env.MONGODB_URL = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
  console.log('#### test ####')
  process.env.PORT = 3000;
  process.env.MONGODB_URL = 'mongodb://localhost:27017/TodoAppTest';
}
