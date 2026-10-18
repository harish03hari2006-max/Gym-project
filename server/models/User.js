// models/User.js
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const localStore = require('../db/localStore');

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  cart:      [
    {
      product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare plain vs hashed
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

const UserProxy = new Proxy(MongooseUser, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    const local = localStore.User;
    if (typeof local[prop] === 'function') {
      return local[prop].bind(local);
    }
    return local[prop];
  }
});

module.exports = UserProxy;
