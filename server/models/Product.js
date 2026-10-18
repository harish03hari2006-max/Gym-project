// models/Product.js
const mongoose   = require('mongoose');
const localStore = require('../db/localStore');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  category:    { type: String, enum: ['whey', 'equipment', 'subliminal'], required: true },
  image:       { type: String, required: false, default: '' },
  inStock:     { type: Boolean, default: true }
}, { timestamps: true });

const MongooseProduct = mongoose.models.Product || mongoose.model('Product', productSchema);

const ProductProxy = new Proxy(MongooseProduct, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    const local = localStore.Product;
    if (typeof local[prop] === 'function') {
      return local[prop].bind(local);
    }
    return local[prop];
  }
});

module.exports = ProductProxy;
