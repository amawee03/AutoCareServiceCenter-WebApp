// src/controllers/authController.js
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import bcrypt from "bcrypt";

// Update logged-in user's profile
export async function updateProfile(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const { name, email, phoneNumbers, address, preferredContactMethod, password } = req.body;

        const update = {};
        if (typeof name !== 'undefined') update.name = name;
        if (typeof email !== 'undefined') update.email = email;
        if (Array.isArray(phoneNumbers)) update.phoneNumbers = phoneNumbers;
        if (typeof address !== 'undefined') update.address = address;
        if (typeof preferredContactMethod !== 'undefined') update.preferredContactMethod = preferredContactMethod;
        if (password) {
            update.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            update,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Keep session user data in sync (email/role)
        req.session.user = {
            id: updatedUser._id.toString(),
            role: updatedUser.role,
            email: updatedUser.email
        };

        return res.status(200).json(updatedUser);
    } catch (error) {
        // Handle duplicate email error gracefully
        if (error && error.code === 11000 && error.keyPattern?.email) {
            return res.status(400).json({ message: "Email already in use" });
        }
        console.error("Update profile error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Signup
export async function signup(req, res) {
    try {
        const { name, email, password, phoneNumbers, address, preferredContactMethod } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({
            name,
            email,
            password,
            phoneNumbers: phoneNumbers || [],
            address: address || "",
            preferredContactMethod: preferredContactMethod || "email"
            // role defaults to "customer"
        });
        await newUser.save();
        req.session.userId = newUser._id;
        req.session.user = { id: newUser._id.toString(), role: newUser.role, email: newUser.email };
        
        console.log("✅ User created successfully:", newUser.email);
        
        res.status(201).json({
            message: "User created and logged in",
            user: {
                id: newUser._id,
                _id: newUser._id,
                name,
                email,
                phoneNumbers: newUser.phoneNumbers,
                address: newUser.address,
                preferredContactMethod: newUser.preferredContactMethod,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// Login
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        req.session.userId = user._id;
        req.session.user = { id: user._id.toString(), role: user.role, email: user.email };
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumbers: user.phoneNumbers,
                address: user.address,
                preferredContactMethod: user.preferredContactMethod,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Get logged-in user profile
export async function getProfile(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const user = await User.findById(req.session.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Logout
export function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ message: "Could not log out" });
        }
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logged out successfully" });
    });
}

// Delete logged-in user's account and end session
export async function deleteOwnAccount(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const userId = req.session.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Optional cleanup: remove user's vehicles
        await Vehicle.deleteMany({ owner: userId });

        await User.deleteOne({ _id: userId });

        req.session.destroy((err) => {
            if (err) {
                console.error("Session destroy error after delete:", err);
            }
        });
        res.clearCookie("connect.sid");

        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete own account error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}