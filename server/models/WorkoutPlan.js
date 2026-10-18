// models/WorkoutPlan.js
const mongoose   = require('mongoose');
const localStore = require('../db/localStore');

const workoutPlanSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  level:       { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  description: { type: String, required: true },
  exercises:   [{ type: String }]
}, { timestamps: true });

const MongooseWorkoutPlan = mongoose.models.WorkoutPlan || mongoose.model('WorkoutPlan', workoutPlanSchema);

const WorkoutPlanProxy = new Proxy(MongooseWorkoutPlan, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    const local = localStore.WorkoutPlan;
    if (typeof local[prop] === 'function') {
      return local[prop].bind(local);
    }
    return local[prop];
  }
});

module.exports = WorkoutPlanProxy;
