const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

UserSchema.methods.comparePassword = async function (userPassword) {
  const isMath = await bcrypt.compare(userPassword, this.password);
  return isMath;
};

module.exports = mongoose.model('User', UserSchema);
