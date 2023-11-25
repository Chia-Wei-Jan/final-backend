const md5 = require('md5'); // If you're using the 'md5' package
const mongoose = require('mongoose');
const User = require('./userSchema');
const Profile = require('./profileSchema');
let sessionUser = {};
let cookieKey = "sid";

const SECRET_KEY = "myHardcodedSecret";

let userObjs = {};

function isLoggedIn(req, res, next) {
    const sid = req.cookies[cookieKey];

    // no sid for cookie key
    if (!sid) {
        return res.status(401).send({ error: 'You are not logged in' });
    }

    let username = sessionUser[sid];

    // no username mapped to sid
    if (username) {
        req.username = username;
        next();
    }
    else {
        return res.status(401).send({ error: 'Invalid session' });
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


// module.exports.isLoggedIn = isLoggedIn;

exports.isLoggedIn = isLoggedIn;

exports.initialize = (app) => {
    app.post('/login', login);
    app.post('/register', register);
    app.put('/logout', isLoggedIn, logout);
    app.put('/password', isLoggedIn, changePassword);
};

exports.sessionUser = sessionUser;