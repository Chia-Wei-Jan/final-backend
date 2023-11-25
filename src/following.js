const mongoose = require('mongoose');
const User = require('./userSchema');

const { isLoggedIn } = require('./auth');


async function getFollowing(req, res) {
    const username = req.params.user || req.username;

    try {
        const currentUser = await User.findOne({ username: username }).populate('following', 'username');

        if(!currentUser) {
            return res.status(404).send({error: 'User not found' });
        }

        const followingUsernames = currentUser.following.map(userData => userData.username);
        res.status(200).json({ username: username, following: followingUsernames });
    }
    catch (error) {
        res.status(500).send({error: 'Internal server error'});
    }
}

async function addFollowing(req, res) {
    const { user } = req.params;    // Username of the user to follow
    const loggedInUser = req.username;  // Set by isLoggedIn middleware

    try {
        const userToFollow = await User.findOne({ username: user });
        if(!userToFollow) {
            return res.status(404).send({ error: 'User to follow not found' });
        }
        await User.updateOne(
            { username: loggedInUser },
            { $addToSet: { following: userToFollow._id } }
        );

        const updatedUser = await User.findOne({ username: loggedInUser }).populate('following');
        res.status(200).json({ username: loggedInUser, following: updatedUser.following.map(follow => follow.username) });
    }
    catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
}


async function removeFollowing(req, res) {
    const { user } = req.params;     // Username of the user to follow
    const loggedInUser = req.username    // Set by isLoggedIn middleware

    try {
        const userToUnfollow = await User.findOne({ username: user });
        
        if(!userToUnfollow) {
            return res.status(404).send({ error: 'User to unfollow not found' });
        }

        await User.updateOne(
            { username: loggedInUser },
            { $pull: { following: userToUnfollow._id }}
        );

        const updatedUser = await User.findOne({ username: loggedInUser }).populate('following');
        res.status(200).json({ username: loggedInUser, following: updatedUser.following.map(follow => follow.username) });
    }
    catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
}


module.exports = (app) => {
    app.get('/following/:user?', isLoggedIn, getFollowing);
    app.put('/following/:user', isLoggedIn, addFollowing);
    app.delete('/following/:user', isLoggedIn, removeFollowing);
}