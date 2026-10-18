const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));           // allow all origins in dev
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve static frontend files ───────────────────────────────────────────────
// The frontend lives one level up from /server (project root)
const frontendRoot = path.join(__dirname, '..');
app.use(express.static(frontendRoot));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/products',     require('./routes/products'));
app.use('/api/plans',        require('./routes/workoutPlans'));
app.use('/api/cart',         require('./routes/cart'));
app.use('/api/orders',       require('./routes/orders'));
app.use('/api/contact',      require('./routes/contact'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/admin',        require('./routes/admin'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Fallback: serve index2.html for any unmatched route (Express 5 compatible) ─
app.use((req, res) => {
  res.sendFile(path.join(frontendRoot, 'index2.html'));
});

// ── Connect to MongoDB & start server ────────────────────────────────────────
const PORT      = process.env.PORT      || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vitaflex';

app.listen(PORT, () => {
  console.log(`🚀  Vitaflex server running → http://localhost:${PORT}`);
  connectMongo();
});

async function connectMongo() {
  try {
    console.log('⏳  Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅  MongoDB Atlas connected successfully!');
    await seedIfEmpty();
  } catch (err) {
    console.warn('⚠️  MongoDB connection notice:', err.message);
    console.warn('ℹ️  Operating in standalone storage mode. Accounts, products, cart, and orders remain active in server/data/');
    await seedIfEmpty();
  }
}

// ── Seed initial data ─────────────────────────────────────────────────────────
async function seedIfEmpty() {
  const User        = require('./models/User');
  const Product     = require('./models/Product');
  const WorkoutPlan = require('./models/WorkoutPlan');
  const Testimonial = require('./models/Testimonial');

  if (await User.countDocuments() === 0) {
    await User.create({
      name: 'Admin User',
      email: 'admin@vitaflex.com',
      password: 'adminpassword123',
      role: 'admin'
    });
    await User.create({
      name: 'Demo Member',
      email: 'demo@vitaflex.com',
      password: 'demopassword123',
      role: 'user'
    });
    console.log('🌱  Default admin and demo users seeded');
  }

  if (await Product.countDocuments() === 0) {
    await Product.insertMany([
      // Whey proteins
      {
        name: 'Optimum Gold Standard',
        description: '24g protein per scoop. Trusted by athletes worldwide.',
        price: 3499,
        category: 'whey',
        image: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcT-Bp_g5iSmYtX1JfPH8AUB1xw9b9aWGQ-5GEeuOWG3BCBp95d3b8IZ7YWP7AE0oSh7GMshUOUHMwlBp1WVL6p1FJYhW0c8mwHeCcpUgP-kC7PGdAZ3Tzym5yr8lkohMSgK4yZFUA&usqp=CAc'
      },
      {
        name: 'Dymatize Elite Whey',
        description: 'Supports muscle recovery with delicious flavors.',
        price: 2799,
        category: 'whey',
        image: 'https://buvi07.neocities.org/image/71YJpLWiATL._SL1500_.jpg'
      },
      {
        name: 'MyProtein Impact Whey',
        description: 'Affordable, clean protein. Ideal for daily intake.',
        price: 1999,
        category: 'whey',
        image: 'https://www.myprotein.co.in/images?url=https://static.thcdn.com/productimg/original/15294747-1105223774381369.jpg&format=webp&auto=avif&crop=1100,1200,smart'
      },
      {
        name: 'MuscleBlaze Whey Protein',
        description: 'Indian favorite with great absorption and results.',
        price: 2499,
        category: 'whey',
        image: 'https://img6.hkrtcdn.com/39079/prd_3907885-MuscleBlaze-Biozyme-Performance-Whey-3.85-lb-Triple-Chocolate_o.jpg'
      },
      // Equipment
      {
        name: 'Adjustable Dumbbells',
        description: 'Perfect for home workouts. Save space and build strength.',
        price: 4999,
        category: 'equipment',
        image: 'https://m.media-amazon.com/images/I/71RP8a0mNlL._AC_UF1000,1000_QL80_.jpg'
      },
      {
        name: 'Resistance Band Set',
        description: 'Great for mobility, strength, and stretching anywhere you go.',
        price: 799,
        category: 'equipment',
        image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRDoLAqR0PIkYoPKedqMOFeX1YNuReNjax88yGmcXjlX16hd1NqmEhEMr8e3agNxjCEZdHdu3oDFVjQ_ZqOFRp_zhF8uqxBRSNVt3-yuCA'
      },
      {
        name: 'Ab Roller Wheel',
        description: 'Target your core and improve stability with this compact gear.',
        price: 499,
        category: 'equipment',
        image: 'https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2012/10/ab_wheel_article.jpg'
      },
      // Subliminal
      {
        name: 'Daily Motivation',
        description: 'Powerful affirmations to keep your mind focused and committed. Fuel your day with positivity.',
        price: 199,
        category: 'subliminal',
        image: ''
      },
      {
        name: 'Visualization Tracks',
        description: 'Guided imagery that enhances your goals — from weight loss to muscle building, visualize and win.',
        price: 299,
        category: 'subliminal',
        image: ''
      },
      {
        name: 'Mindset Audio Therapy',
        description: 'Relaxing subliminal audios designed to build consistency, focus, and recovery mindset.',
        price: 249,
        category: 'subliminal',
        image: ''
      }
    ]);
    console.log('🌱  Products seeded');
  }

  if (await WorkoutPlan.countDocuments() === 0) {
    await WorkoutPlan.insertMany([
      {
        title: 'Beginner Plan',
        level: 'beginner',
        description: 'Start strong with basics in cardio, strength & mobility.',
        exercises: ['Jumping Jacks 3x30', 'Push-ups 3x10', 'Bodyweight Squats 3x15', 'Plank 3x30s', 'Walking Lunges 3x10']
      },
      {
        title: 'Intermediate Plan',
        level: 'intermediate',
        description: 'Push your limits with advanced strength & endurance training.',
        exercises: ['Pull-ups 4x8', 'Dumbbell Press 4x10', 'Deadlift 4x8', 'Rows 4x10', 'HIIT Cardio 20min']
      },
      {
        title: 'Advanced Plan',
        level: 'advanced',
        description: 'High-performance routines for muscle building and agility.',
        exercises: ['Barbell Squat 5x5', 'Bench Press 5x5', 'Weighted Pull-ups 4x6', 'Romanian Deadlift 4x8', 'Plyometrics 30min']
      }
    ]);
    console.log('🌱  Workout plans seeded');
  }

  if (await Testimonial.countDocuments() === 0) {
    await Testimonial.insertMany([
      {
        author: 'Arjun',
        date: 'March 2025',
        content: '"Vitaflex gave me the confidence and strength I lacked. Best decision ever!"',
        approved: true
      },
      {
        author: 'Priya',
        date: 'Feb 2025',
        content: '"App is smooth, plans are solid, and support is real. Loved it!"',
        approved: true
      }
    ]);
    console.log('🌱  Testimonials seeded');
  }
}
