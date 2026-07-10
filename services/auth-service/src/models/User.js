const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ROLES = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CITIZEN,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
