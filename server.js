const express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  mongoose = require('mongoose'),
  http = require('http'),
  fallback = require('express-history-api-fallback'),
  config = require('./config/DB');

mongoose.Promise = global.Promise;
mongoose.connect(config.DB, {useNewUrlParser: true}).then(
  () => {console.log('Database is connected') },
  err => { console.log('Can not connect to the database'+ err)}
);
const userRoutes = require('./routes/user.route');
const root = __dirname + '/dist/ConveyFeed';
const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 4000;
app.use((err, req, res, next) => {
  console.log(err);
  console.log('error : ;');
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  })
});
app.use('/user', userRoutes);
app.use(express.static(root));
app.use(fallback('dist/ConveyFeed/index.html', { root : __dirname}));

const server = http.createServer(app);
server.listen(port, () => {
  console.log('Listening on port ' + port);
});

