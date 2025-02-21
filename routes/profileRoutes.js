const { Hono } = require("hono");
const jwt = require("jsonwebtoken");
const Profile = require("../models/profiles");

const profileRoute = new Hono();


const authenticate = async (c, next) => {
 
  try {
    const authHeader = c.req.header("Authorization");
   

    if (!authHeader) {
     
      return c.json({ success: false, error: "No token provided" }, 401);
    }

    if (!authHeader.startsWith("Bearer ")) {
      
      return c.json({ success: false, error: "Invalid auth format" }, 401);
    }

    const token = authHeader.split(" ")[1]; // Extract token
   
    if (!token) {
      
      return c.json({ success: false, error: "Token missing" }, 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
     
      c.set("userId", decoded.id); 
      await next();
    } catch (error) {
      console.log("JWT Verification Error:", error.message);
      return c.json({ success: false, error: "Invalid token" }, 401);
    }
  } catch (error) {
    console.log("Unexpected Error:", error);
    return c.json({ success: false, error: "Authentication failed" }, 500);
  }
};


// ✅ Create Profile (Uses Token ID)
profileRoute.post("/", authenticate, async (c) => {
  
  try {
   
    
    const userId = c.get("userId");
    const body = await c.req.json();

    
    const existingProfile = await Profile.findOne({ userId });
    if (existingProfile) {
      return c.json({ success: false, error: "Profile already exists" }, 400);
    }

    const profileData = { ...body, userId };
    const profile = await Profile.create(profileData);

    return c.json({ success: true, profile });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ✅ Get Current User's Profile
profileRoute.get("/me", authenticate, async (c) => {
  try {
    const userId = c.get("userId");
    const profile = await Profile.findOne({ userId });

    if (!profile) return c.json({ success: false, error: "Profile not found" }, 404);

    return c.json({ success: true, profile });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ✅ Update Current User's Profile
profileRoute.put("/me", authenticate, async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    const profile = await Profile.findOneAndUpdate({ userId }, body, { new: true });

    if (!profile) return c.json({ success: false, error: "Profile not found" }, 404);

    return c.json({ success: true, profile });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ✅ Delete Current User's Profile
profileRoute.delete("/me", authenticate, async (c) => {
  try {
    const userId = c.get("userId");

    const profile = await Profile.findOneAndDelete({ userId });

    if (!profile) return c.json({ success: false, error: "Profile not found" }, 404);

    return c.json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ✅ Get All Profiles (For Admin)
profileRoute.get("/", async (c) => {
  try {
    const profiles = await Profile.find();
    return c.json({ success: true, profiles });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ✅ Get Profile by ID (For Admin or Public)
profileRoute.get("/:id", async (c) => {
  try {
    const profile = await Profile.findById(c.req.param("id"));
    if (!profile) return c.json({ success: false, error: "Profile not found" }, 404);
    return c.json({ success: true, profile });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ✅ Update Profile by ID (Admin or Owner)
profileRoute.put("/:id", async (c) => {
  try {
    const body = await c.req.json();
    const profile = await Profile.findByIdAndUpdate(c.req.param("id"), body, { new: true });

    if (!profile) return c.json({ success: false, error: "Profile not found" }, 404);

    return c.json({ success: true, profile });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ✅ Delete Profile by ID (Admin)
profileRoute.delete("/:id", async (c) => {
  try {
    const profile = await Profile.findByIdAndDelete(c.req.param("id"));
    if (!profile) return c.json({ success: false, error: "Profile not found" }, 404);
    return c.json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

module.exports = profileRoute;
