const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const auth = require('./src/auth');
const profile = require('./src/profile');
const article = require('./src/articles');
const following = require('./src/following');

const connectionString = 'mongodb+srv://cj35:cj35@eddie.nrfgvli.mongodb.net/?retryWrites=true&w=majority';


const hello = (req, res) => res.send({ hello: 'world' });


mongoose.connect(connectionString)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });


const app = express();


app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true, // This allows the browser to send cookies
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: 'doNotGuessTheSecret',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.get('/', hello);
auth.initialize(app); 
auth.initializeGoogleAuth(app);
profile(app);
article(app);
following(app);


// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  const addr = server.address();
  console.log(`Server listening at http://${addr.address}:${addr.port}`)
});

module.exports = app;