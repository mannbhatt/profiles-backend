const { Hono } = require('hono');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userRoutes = new Hono();
const SECRET = process.env.JWT_SECRET; 

// 🔹 Register a new user
userRoutes.post('/register', async (c) => {
  try {
    const { username, email, password } = await c.req.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return c.json({ error: 'User already exists' }, 400);

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, passwordHash: hashedPassword });

    await newUser.save();
    return c.json({ message: 'User registered successfully' }, 201);
  } catch (error) {
    return c.json({ error: 'Error registering user' }, 500);
  }
});

// 🔹 Login User
userRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    
    const user = await User.findOne({ email });
    if (!user) return c.json({ error: 'Invalid credentials' }, 400);

   
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return c.json({ error: 'Invalid credentials' }, 400);

    
    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '1h' });
    return c.json({ message: 'Login successful', token });
  } catch (error) {
    return c.json({ error: 'Error logging in' }, 500);
  }
});

// 🔹 Get All Users
userRoutes.get('/', async (c) => {
  try {
    const users = await User.find().select('-passwordHash'); // Exclude passwords
    return c.json(users);
  } catch (error) {
    return c.json({ error: 'Error fetching users' }, 500);
  }
});

// 🔹 Get User by ID
userRoutes.get('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const user = await User.findById(id).select('-passwordHash');
    if (!user) return c.json({ error: 'User not found' }, 404);
    return c.json(user);
  } catch (error) {
    return c.json({ error: 'Error fetching user' }, 500);
  }
});

// 🔹 Update User
userRoutes.put('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const { username, email } = await c.req.json();

    const updatedUser = await User.findByIdAndUpdate(id, { username, email }, { new: true, runValidators: true }).select('-passwordHash');
    if (!updatedUser) return c.json({ error: 'User not found' }, 404);

    return c.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    return c.json({ error: 'Error updating user' }, 500);
  }
});

// 🔹 Delete User
userRoutes.delete('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return c.json({ error: 'User not found' }, 404);

    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Error deleting user' }, 500);
  }
});

module.exports = userRoutes;
