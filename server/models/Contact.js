// models/Contact.js
const mongoose   = require('mongoose');
const localStore = require('../db/localStore');

const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, trim: true },
  message: { type: String, required: true }
}, { timestamps: true });

const MongooseContact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

const ContactProxy = new Proxy(MongooseContact, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    const local = localStore.Contact;
    if (typeof local[prop] === 'function') {
      return local[prop].bind(local);
    }
    return local[prop];
  }
});

module.exports = ContactProxy;
