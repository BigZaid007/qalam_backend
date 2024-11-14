const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken'); // Use require for jwt
const User = require('../models/user');

// const express = express();
const router = express.Router();


router.post('/register', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Ensure that either username or email is provided along with password
        if ((!username && !email) || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide either a username or email along with the password."
            });
        }

        // Check if a user with the same username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with the available fields
        const userData = { name, password: hashedPassword };
        if (username) userData.username = username;
        if (email) userData.email = email;

        const user = await User.create(userData);

        res.status(200).json({
            success: true,
            data: user,
            message: "User created successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Check if username or email is provided
        if (!email && !username) {
            return res.status(400).json({
                success: false,
                message: "Please provide either a username or email"
            });
        }

        // Find user by username or email
        const user = await User.findOne({ $or: [{ username }, { email }] });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password"
            });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, 'secretKey', { expiresIn: '1d' });

        res.status(200).json({
            success: true,
            token,
            data: user,
            message: "User logged in successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
});



module.exports = router