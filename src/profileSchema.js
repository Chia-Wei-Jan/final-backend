const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    headline: { type: String, default: 'New User' },
    email: String,
    dob: Date,
    zipcode: String,
    phone: String,
    avatar: String
});


const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;