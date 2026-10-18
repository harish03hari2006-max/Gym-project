// server/seedLocal.js
const localStore = require('./db/localStore');

async function seed() {
  const users = await localStore.User.find();
  const hasAdmin = users.some(u => u.email === 'admin@vitaflex.com');
  if (!hasAdmin) {
    await localStore.User.create({
      name: 'Admin User',
      email: 'admin@vitaflex.com',
      password: 'adminpassword123',
      role: 'admin'
    });
    console.log('✅ Admin user seeded: admin@vitaflex.com / adminpassword123');
  }

  const pCount = await localStore.Product.countDocuments();
  if (pCount === 0) {
    await localStore.Product.insertMany([
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
      }
    ]);
    console.log('✅ Products seeded in local data store');
  }

  const plCount = await localStore.WorkoutPlan.countDocuments();
  if (plCount === 0) {
    await localStore.WorkoutPlan.insertMany([
      {
        title: 'Beginner Plan',
        level: 'beginner',
        description: 'Start strong with basics in cardio, strength & mobility.'
      },
      {
        title: 'Intermediate Plan',
        level: 'intermediate',
        description: 'Push your limits with advanced strength & endurance training.'
      },
      {
        title: 'Advanced Plan',
        level: 'advanced',
        description: 'High-performance routines for muscle building and agility.'
      }
    ]);
    console.log('✅ Workout plans seeded in local data store');
  }

  const tCount = await localStore.Testimonial.countDocuments();
  if (tCount === 0) {
    await localStore.Testimonial.insertMany([
      {
        author: 'Arjun',
        date: 'March 2025',
        content: 'Vitaflex gave me the confidence and strength I lacked. Best decision ever!',
        approved: true
      },
      {
        author: 'Priya',
        date: 'Feb 2025',
        content: 'App is smooth, plans are solid, and support is real. Loved it!',
        approved: true
      }
    ]);
    console.log('✅ Testimonials seeded in local data store');
  }
}

seed().catch(console.error);
