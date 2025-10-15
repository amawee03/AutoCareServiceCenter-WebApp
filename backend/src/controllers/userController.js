// src/controllers/userController.js
import User from "../models/User.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ✅ MUST be exported
export async function getAllUsers(req, res) {
    try {
        const userRole = req.session?.user?.role;
        
        // If receptionist, only show customers
        let query = {};
        if (userRole === 'receptionist') {
            query.role = 'customer';
        }
        
        const users = await User.find(query).select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getAllUsers controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: create any user with role and credentials
export async function createUser(req, res) {
    try {
        const userRole = req.session?.user?.role;
        
        // Only admin can create users
        if (userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only admins can create users" });
        }
        
        const { name, email, password, role = 'customer', phoneNumbers = [], address = '', preferredContactMethod = 'email' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = new User({ name, email, password, role, phoneNumbers, address, preferredContactMethod });
        await user.save();

        return res.status(201).json({
            message: "User created",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNumbers: user.phoneNumbers,
                address: user.address,
                preferredContactMethod: user.preferredContactMethod
            }
        });
    } catch (error) {
        console.error("Error in createUser controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { name, email, phoneNumbers, address, preferredContactMethod, role, password } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const userRole = req.session?.user?.role;
        const isAdmin = userRole === 'admin';
        
        // Receptionists can only update customer profiles, not their own or other staff
        if (userRole === 'receptionist') {
            const targetUser = await User.findById(id);
            if (!targetUser || targetUser.role !== 'customer') {
                return res.status(403).json({ message: "Forbidden: Receptionists can only update customer profiles" });
            }
        } else if (!isAdmin && req.session.userId.toString() !== id) {
            return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
        }

        const update = { name, email, phoneNumbers, address, preferredContactMethod };
        if (isAdmin && role) update.role = role;
        if (password) {
            update.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            update,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error in updateUser controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const userRole = req.session?.user?.role;
        const isAdmin = userRole === 'admin';
        
        // Only admin can delete users (receptionists cannot delete)
        if (userRole === 'receptionist') {
            return res.status(403).json({ message: "Forbidden: Receptionists cannot delete users" });
        }
        
        if (!isAdmin && req.session.userId.toString() !== id) {
            return res.status(403).json({ message: "Forbidden: You can only delete your own account" });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // If user deleted themselves, log them out; if admin deleted someone else, just return success
        if (!isAdmin && req.session.userId.toString() === id) {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Session destroy error:", err);
                    return res.status(500).json({ message: "Account deleted but logout failed" });
                }
                res.clearCookie("connect.sid");
                return res.status(200).json({ message: "User deleted successfully" });
            });
        } else {
            return res.status(200).json({ message: "User deleted successfully" });
        }
    } catch (error) {
        console.error("Error in deleteUser controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}