const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");



require("dotenv").config();

const signUp = async (c) => {
  try {
    

    
    const { username, email, password } = await c.req.json();

    if (!username || !email || !password) {
      return c.json({ error: "Username, email, and password are required" }, 400);
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return c.json({ error: "Username or email already exists" }, 400);
    }

    
    const passwordHash = await bcrypt.hash(password, 10);

    
    const newUser = new User({ username, email, passwordHash });
    await newUser.save();

   

    
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "3h", 
    });

    
    return c.json({
      message: "Signup successful",
      token, 
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Internal server error", details: error.message }, 500);
  }
};







const signIn = async (c) => {
  try {
   

    
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

   
    const user = await User.findOne({ email });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

     
    if (!user.passwordHash) {
      return c.json({ error: "Password not set for this user" }, 400);
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordsMatch) {
      return c.json({ error: "Invalid password" }, 401);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3h", 
    });

    
    return c.json({
      message: "Signin successful",
      token, 
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

module.exports = { signUp, signIn };
