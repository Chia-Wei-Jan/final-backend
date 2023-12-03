const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [false, 'Username is required'],
    unique: true
  },
  email: {
    type: String,
    required: [false, 'Email is required'],
    unique: true
  },
  dob: {
    type: Date,
    required: [false, 'Date of Birth is required']
  },
  phone: {
    type: String,
    required: [false, 'Phone number is required']
  },
  zipcode: {
    type: String,
    required: [false, 'Zipcode is required']
  },
  hash: String,
  salt: String,
  created: {
    type: Date,
    default: Date.now
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'    // References the UserSchema
  }],
  googleId: String,
  authType: String
})


const User = mongoose.model('User', userSchema);
module.exports = User;