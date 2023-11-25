const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  dob: {
    type: Date,
    required: [true, 'Date of Birth is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  zipcode: {
    type: String,
    required: [true, 'Zipcode is required']
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
})


const User = mongoose.model('User', userSchema);
module.exports = User;