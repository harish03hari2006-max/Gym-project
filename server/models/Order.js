// models/Order.js
const mongoose   = require('mongoose');
const localStore = require('../db/localStore');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String },
  price:    { type: Number },
  quantity: { type: Number, default: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:   [orderItemSchema],
  total:   { type: Number, required: true },
  status:  { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  address: {
    line1: String,
    city:  String,
    state: String,
    zip:   String
  }
}, { timestamps: true });

const MongooseOrder = mongoose.models.Order || mongoose.model('Order', orderSchema);

const OrderProxy = new Proxy(MongooseOrder, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    const local = localStore.Order;
    if (typeof local[prop] === 'function') {
      return local[prop].bind(local);
    }
    return local[prop];
  }
});

module.exports = OrderProxy;
