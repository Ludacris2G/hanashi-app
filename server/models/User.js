const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, 'Please provide username'],
      minlength: 3,
      maxlength: 12,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
    },
  },
  { timestamps: true }
);
