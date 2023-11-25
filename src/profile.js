const express = require('express');
const mongoose = require('mongoose');
const Profile = require('./profileSchema');
const { isLoggedIn } = require('./auth'); 

async function getHeadline(req, res) {
    const username = req.params.user || req.username;;
    try {
        const profile = await Profile.findOne({ username: username }, 'headline');
        if (!profile) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.status(200).send({ username, headline: profile.headline });
    } 
    catch (error) {
        res.status(500).send({error: 'Internal server error'});
    }
}

async function putHeadline(req, res) {
    const username = req.username;  // Retrieved from isLoggedIn middleware
    const { headline } = req.body;

    if (!headline) {
        return res.status(400).send({ error: 'Headline is required.' });
    }

    try {
        const profile = await Profile.findOneAndUpdate(
            { username: username },
            { $set: { headline: headline } },
            { new: true }
        );

        if (!profile) {
            return res.status(404).send({ error: 'Profile not found' });
        }
        res.status(200).send({ username, headline: profile.headline });
    } 
    catch (error) {
        res.status(500).send({error: 'Internal server error'});
    }
}

async function getEmail(req, res) {
    const username = req.params.user || req.username;;
    try {
        const profile = await Profile.findOne({ username: username }, 'email');

        if(!profile) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.status(200).send({ username, email: profile.email });
    }
    catch (error) {
        res.status(500).send({error: 'Internal server error'});
    }
}

async function putEmail(req, res) {
    const username = req.username; // Retrieved from isLoggedIn middleware
    const { email: newEmailAddress } = req.body;

    try {
        const profile = await Profile.findOneAndUpdate(
            { username: username },
            { $set: { email: newEmailAddress } },
            { new: true }
        );

        if(!profile)
            return res.status(404).send({ error: 'Profile not found' });

        res.status(200).send({ username, email: profile.email })
    }
    catch (error) {
        res.status(500).send({error: 'Internal server error'});
    }
}

async function getZipcode(req, res) {
    const username = req.params.user || req.username;;
    try {
        const profile = await Profile.findOne({ username: username }, 'zipcode');

        if(!profile) {
            return res.status(404).send({error: 'User not found'});
        }
        res.status(200).send({ username, zipcode: profile.zipcode });
    }
    catch (error) {
        res.status(500).send({error: 'Internal server error'});
    }
}

async function putZipcode(req, res) {
    const username = req.username; // Retrieved from isLoggedIn middleware
    const { zipcode: newZipCode } = req.body;

    try {
        const profile = await Profile.findOneAndUpdate(
            { username: username },
            { $set: { zipcode: newZipCode } },
            { new: true }
        );
        if (!profile) {
            return res.status(404).send({ error: 'Profile not found' });
        }
        res.status(200).send({ username, zipcode: profile.zipcode });
    } 
    catch (error) {
        res.status(500).send({error: 'Internal server error'});
    }
}

async function getDob(req, res) {
    const username = req.params.user || req.username;;

    try {
        const profile = await Profile.findOne({username: username}, 'dob');
        if(!profile) {
            return res.status(404).send({error: 'User not found'});
        }
        res.status(200).send({username, dob: profile.dob.getTime() })
    }
    catch (error) {
        res.status(500).send({error: 'Internal server error'});
    }
}


async function getAvatar(req, res) {
    const username = req.params.user || req.username;;

    try {
        const profile = await Profile.findOne({username: username}, 'avatar');
        if(!profile) {
            return res.status(404).send({ error: 'User not found'});
        }
        res.status(200).send({ username, avatar: profile.avatar});
    }
    catch (error) {
        res.status(500).send({error: 'Internal server error'});
    }
}

async function putAvatar(req, res) {
    const username = req.username;   // Retrieved from isLoggedIn middleware
    const { avatar: newAvatar } = req.body;

    try {
        const profile = await Profile.findOneAndUpdate(
            { username: username },
            { $set: { avatar: newAvatar }},
            { new: true }
        );

        if(!profile) {
            return res.status(404).send({ error: 'Profile not found' });
        }
        return res.status(200).send({ username, avatar: profile.avatar });
    }
    catch (error) {
        res.status(500).send({error: 'Internal server error'});
    }
}

async function getPhone(req, res) {
    const username = req.params.user || req.username;;

    try {
        const profile = await Profile.findOne({ username: username }, 'phone');
        if(!profile) {
            return res.status(404).send({error: 'User not found'});
        }
        res.status(200).send({username, phone: profile.phone});
    }
    catch (error) {
        res.status(500).send({error: 'Internal server error'});
    }
}


async function putPhone(req, res) {
    const username = req.username;   // Retrieved from isLoggedIn middleware
    const { phone: newPhone } = req.body;

    try {
        const profile = await Profile.findOneAndUpdate(
            { username: username },
            { $set: { phone: newPhone }},
            { new: true }
        )

        if(!profile) {
            return res.status(404).send({ error: 'Profile not found' });
        }
        res.status(200).send({ username, phone: profile.phone });
    }
    catch (error) {
        res.status(500).send({error: 'Internal server error'});
    }
}


module.exports = (app) => {
    app.get('/headline/:user?', isLoggedIn, getHeadline);
    app.put('/headline', isLoggedIn, putHeadline);
    app.get('/email/:user?', isLoggedIn, getEmail);
    app.put('/email', isLoggedIn, putEmail);
    app.get('/zipcode/:user?', isLoggedIn, getZipcode);
    app.put('/zipcode', isLoggedIn, putZipcode);
    app.get('/dob/:user?', isLoggedIn, getDob);
    app.get('/avatar/:user?', isLoggedIn, getAvatar);
    app.put('/avatar', isLoggedIn, putAvatar);
    app.get('/phone/:user?', isLoggedIn, getPhone);
    app.put('/phone', isLoggedIn, putPhone);
};
