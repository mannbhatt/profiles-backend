require('dotenv').config();
const { Hono } = require('hono');
const { serve } = require('@hono/node-server');
const mongoose = require('mongoose');
const { cors } = require('hono/cors');
// Import Routes
const authRoutes=require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const educationRoutes = require('./routes/educationRoutes');
const experienceRoutes = require('./routes/experienceRoutes');

const app = new Hono();
app.use(cors({
  origin: "http://localhost:5000",
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));



app.route('/api/auth', authRoutes);
app.route('/users', userRoutes);
app.route('/profiles', profileRoutes);
app.route('/education', educationRoutes);
app.route('/experience', experienceRoutes);

app.get('/', (c) => c.text('Welcome to Profiles API 🚀'));


serve({
  fetch: app.fetch,
  port: 5000,
});

console.log("🚀 Server running on http://localhost:5000");
