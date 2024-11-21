const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

exports.register = async (req, res) => {
  const { fname, lname, mnumber, email, password } = req.body;
  console.log(req.body);
  try {
      let user = await User.findOne({ email });
      if (user) {
          return res.status(400).json({ msg: 'User already exists' });
      }
      user = new User({
          fname,
          lname,
          mnumber,
          email,
          password,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save(); // This is where the problem might be occurring
      const payload = {
          user: {
              id: user.id
          }
      };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
          if (err) {
            console.error("JWT error:", err);
            throw err;
          }
          res.status(201).json({ token });
      });
  } catch (err) {
      console.error("Register error:", err); // Enhanced logging
      if (err.code === 11000) {
          return res.status(400).json({ msg: 'Duplicate value error: Email must be unique.' });
      }
      res.status(500).send('Server error');
  }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        const payload = {
            user: {
                id: user.id,
                role: user.role,
                
            }
        };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
            if (err) throw err;
            res.json({ token, role:user.role, user: user });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};



exports.getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.user.id).select('-password');
      if (!user) return res.status(404).json({ msg: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ msg: 'Server error' });
    }
  };


// Update Profile Picture
exports.updateProfilePicture = async (req, res) => {
    try {
      const user = await User.findById(req.user.user.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });
      user.profilePicture = req.file.filename;
      await user.save();
      res.json({ msg: 'Profile picture updated successfully', profilePicture: user.profilePicture });
    } catch (error) {
      res.status(500).json({ msg: 'Server error', error });
    }
  };

  // Update Password
exports.updatePassword = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
  
      const user = await User.findById(req.user.user.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Incorrect old password' });
  
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
      res.json({ msg: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ msg: 'Server error', error });
    }
  };

  exports.getAllUsers = async (req, res) => {
    try {
      // Find all users where role is 'agent'
      const users = await User.find({ role: 'user' });
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  exports.uploadUserDocument = async (req, res) => {
    const userId = req.params.userId;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // Save the file information to the user's document array
      user.documents = user.documents || [];
      user.documents.push({
        filename: req.file.filename,
        path: req.file.path,
      });
  
      await user.save();
  
      res.status(200).json({ message: "Document uploaded successfully." });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Server error." });
    }
  };

  