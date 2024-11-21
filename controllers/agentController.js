const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Create a new agent
exports.createAgent = async (req, res) => {
  const { fname, lname, email, agentRef, password } = req.body;

  console.log("Registering agent:", {
    fname,
    lname,
    email,
    agentRef, 
    password,
  });
  try {
    let user = await User.findOne({ email });

    if (user) {
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      fname,
      lname,
      email,
      agentRef,
      password,
      role: "agent",
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.error("JWT error:", err);
          throw err;
        }
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error('Server error:', error.message);
    res.status(500).send("Server error");
  }
};

exports.getAllAgents = async (req, res) => {
  try {
    // Find all users where role is 'agent'
    const agents = await User.find({ role: 'agent' });
    res.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};