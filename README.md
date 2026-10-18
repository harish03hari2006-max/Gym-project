# Vitaflex - Full-Stack Fitness Web Application

A fitness website integrated with a Node.js, Express.js, and MongoDB/MongoDB Atlas backend.

## Features
- **Frontend Preserved**: 100% original Tailwind CSS styling, color palette, gradients, typography, and responsive design from `index2.html`.
- **User Authentication**: Secure JWT-based registration and login with bcrypt password hashing (`/api/auth`).
- **Product Management**: Live Whey Protein, Gym Equipment, and Subliminal Boost cards served from MongoDB (`/api/products`).
- **Workout Plans**: Workout routines categorized by Beginner, Intermediate, and Advanced levels (`/api/plans`).
- **Interactive Shopping Cart**: Slide-in cart drawer with live quantity increments/decrements, item removals, and real-time total calculation (`/api/cart`).
- **Order Placement**: One-click order creation from active cart with address support (`/api/orders`).
- **Contact Inquiries**: Inline contact form saving user enquiries directly to the database (`/api/contact`).
- **Admin Dashboard**: Full management panel at `admin.html` with real-time stats, order status controls, product creation/deletion, message viewer, and user administration.
- **Dual Storage Engine**: Automatic standalone storage fallback (`server/data/`) so the app runs without external dependencies if MongoDB is offline, and connects to MongoDB Atlas when `MONGO_URI` is provided.

## Project Structure
```
GYM-Project/
├── index2.html          # Main website (source of truth for frontend design)
├── login.html           # User login page
├── register.html        # User registration page
├── admin.html           # Full-featured admin management panel
├── package.json         # Root scripts (npm start, npm run dev)
├── .gitignore           # Git ignore rules
├── js/
│   ├── api.js           # Centralized API client (fetch wrappers)
│   ├── auth.js          # Authentication state & session helpers
│   ├── cart.js          # Shopping cart drawer & badge manager
│   └── main.js          # Frontend page controller & DOM updater
└── server/
    ├── package.json     # Backend dependencies
    ├── index.js         # Express server entry point & MongoDB connector
    ├── .env.example     # Environment template
    ├── db/
    │   └── localStore.js # Synchronous chainable query builder & storage engine
    ├── middleware/
    │   └── auth.js      # JWT protect & adminOnly middleware
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   ├── WorkoutPlan.js
    │   ├── Order.js
    │   ├── Contact.js
    │   └── Testimonial.js
    └── routes/
        ├── auth.js
        ├── products.js
        ├── workoutPlans.js
        ├── cart.js
        ├── orders.js
        ├── contact.js
        ├── testimonials.js
        └── admin.js
```

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
cd ..
```

### 2. Configure Environment Variables
Copy `.env.example` in the `server` directory to `.env`:
```bash
cp server/.env.example server/.env
```
Update `MONGO_URI` in `server/.env` with your MongoDB connection string (or MongoDB Atlas cluster URI).

### 3. Start the Server
From the root directory:
```bash
npm start
```
Or from inside `server/`:
```bash
node index.js
```

### 4. Open in Browser
- **Main Website**: http://localhost:5000/index2.html
- **Login**: http://localhost:5000/login.html
- **Register**: http://localhost:5000/register.html
- **Admin Dashboard**: http://localhost:5000/admin.html

### Default Admin Credentials
- **Email**: `admin@vitaflex.com`
- **Password**: `adminpassword123`
