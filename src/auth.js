const md5 = require('md5'); // If you're using the 'md5' package
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./userSchema');
const Profile = require('./profileSchema');
let sessionUser = {};
let cookieKey = "sid";

const SECRET_KEY = "myHardcodedSecret";

let userObjs = {};

async function isLoggedIn(req, res, next) {
    const sid = req.cookies[cookieKey];

    // no sid for cookie key
    if (!sid) {
        return res.status(401).send({ error: 'You are not logged in' });
    }

    let username = sessionUser[sid];

    // no username mapped to sid
    if (!username) {
        return res.status(401).send({ error: 'Invalid session' });
    }

    try {
        // Fetch the user by username
        const user = await User.findOne({ username }).exec();

        if (!user) {
            return res.status(401).send({ error: 'User not found' });
        }

        // Add username and following list to the request object
        req.username = username;
        req.following = user.following;

        next();
    } catch (error) {
        console.error('Error in isLoggedIn:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
}

async function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ error: 'Username and password are required.' });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).send({ error: 'Invalid username or password' });
        }

        const hash = md5(user.salt + password);

        if (hash === user.hash) {
            const sessionKey = md5(SECRET_KEY + new Date().getTime() + user.username);
            sessionUser[sessionKey] = user.username; 

            res.cookie(cookieKey, sessionKey, { maxAge: 3600 * 1000, httpOnly: true, sameSite: 'Lax' });

            res.status(200).send({ username: user.username, result: 'success' });
        } else {
            res.status(401).send({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal server error' });
    }
}

async function register(req, res) {
    const {username, email, dob, phone, zipcode, password} = req.body;


    if (!username || !email || !dob || !phone || !zipcode || !password) {
        return res.status(400).send({ error: 'All fields are required.'});
    }

    try {
        let existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).send({ error: 'User already exists.' });
        }

        let salt = username + new Date().getTime();
        let hash = md5(salt + password);

        const user = new User({
            username,
            email,
            dob: new Date(dob), 
            phone,
            zipcode,
            salt,
            hash
        });
        const savedUser = await user.save();
        const profile = new Profile({
            username,
            email,
            dob: new Date(dob),
            zipcode,
            phone,
            headline: 'New user',
            avatar: 'https://i.pinimg.com/736x/af/98/92/af9892e7577db568594339ec1b8c1ee4.jpg'
        });

        await profile.save();

        const sessionKey = md5(SECRET_KEY + new Date().getTime() + user.username);
        sessionUser[sessionKey] = user.username; 

        res.cookie(cookieKey, sessionKey, { maxAge: 3600 * 1000, httpOnly: true, sameSite: 'Lax' });

        res.status(200).send({ result: 'success', username: savedUser.username });
    } catch (error) {
        res.status(500).send({ error: 'Email already exists.' });
    }
}

function logout(req, res) {
    let sid = req.cookies[cookieKey];
    delete sessionUser[sid]; 

    res.clearCookie(cookieKey); 
    res.send({result: 'OK'});
}

async function changePassword(req, res) {
    const { password: newPassword } = req.body;

    const username = req.username; // Retrieved from the isLoggedIn middleware
  
    if (!newPassword) {
      return res.status(400).send({ error: 'New password is required.' });
    }
  
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).send({ error: 'User not found' });
      }
  
      const newHash = md5(user.salt + newPassword);
      user.hash = newHash;
      await user.save();
  
      res.status(200).send({ username: user.username, result: 'success' });
    } 
    catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Internal server error' });
    }
}

passport.use(new GoogleStrategy({
    clientID: '930081156832-va0vtlqfsjbq1be7j8jpagnl7pl0798v.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
      const googleId = profile.id;
      let user = await User.findOne({ googleId });

      if (!user) {
          user = new User({
            username: profile.displayName,
            googleId: googleId,
            authType: 'google',
            email: profile.emails ? profile.emails[0].value : undefined,
          });
          await user.save();
      }

      done(null, user);
  }
));

// Google OAuth2 Routes
function initializeGoogleAuth(app) {
    app.get('/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'] }));

    app.get('/auth/google/callback', 
        passport.authenticate('google', { failureRedirect: 'http://localhost:4200/login' }),
        function(req, res) { 
            // Successful authentication, redirect home or another page.
            const username = req.user.username;

            res.redirect('http://localhost:4200/main?username=${req.user.username}');
        });
}




exports.isLoggedIn = isLoggedIn;

exports.initialize = (app) => {
    app.post('/login', login);
    app.post('/register', register);
    app.put('/logout', isLoggedIn, logout);
    app.put('/password', isLoggedIn, changePassword);
};

exports.sessionUser = sessionUser;
exports.initializeGoogleAuth = initializeGoogleAuth;