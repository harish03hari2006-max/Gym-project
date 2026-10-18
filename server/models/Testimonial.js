// models/Testimonial.js
const mongoose   = require('mongoose');
const localStore = require('../db/localStore');

const testimonialSchema = new mongoose.Schema({
  author:  { type: String, required: true, trim: true },
  date:    { type: String, required: true },
  content: { type: String, required: true },
  approved:{ type: Boolean, default: true }
}, { timestamps: true });

const MongooseTestimonial = mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema);

const TestimonialProxy = new Proxy(MongooseTestimonial, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    const local = localStore.Testimonial;
    if (typeof local[prop] === 'function') {
      return local[prop].bind(local);
    }
    return local[prop];
  }
});

module.exports = TestimonialProxy;
