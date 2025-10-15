// src/controllers/InventoryController.js
import Inventory from "../models/InventoryModel.js";

// Get all inventory
export const getAllInventory = async (req, res, next) => {
    let inventory;
    try {
        inventory = await Inventory.find();   
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!inventory) {
        return res.status(404).json({ message: "Product not found" });
    }
    
    return res.status(200).json({ inventory });
};

// Add inventory
export const addInventory = async (req, res, next) => {
    const { productName, category, currentStockQuantity, reorderlevel } = req.body;
    let inventory;
    
    try {
        inventory = new Inventory({ 
            productName, 
            category, 
            currentStockQuantity, 
            reorderlevel 
        });
        await inventory.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!inventory) {
        return res.status(404).json({ message: "Unable to add inventory" });
    }
    
    return res.status(201).json({ inventory });
};

// Get by ID
export const getById = async (req, res, next) => {
    const id = req.params.id;
    let product;
    
    try {
        product = await Inventory.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    
    return res.status(200).json({ product });
};

// Update inventory
export const updateInventory = async (req, res, next) => {
    const id = req.params.id;
    const { productName, category, currentStockQuantity, reorderlevel } = req.body;
    let inventory;
    
    try {
        inventory = await Inventory.findByIdAndUpdate(
            id, 
            { 
                productName, 
                category, 
                currentStockQuantity, 
                reorderlevel 
            },
            { new: true }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!inventory) {
        return res.status(404).json({ message: "Unable to Update Inventory Details" });
    }
    
    return res.status(200).json({ inventory });
};

// Delete inventory
export const deleteInventory = async (req, res, next) => {
    const id = req.params.id;
    let inventory;
    
    try {
        inventory = await Inventory.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!inventory) {
        return res.status(404).json({ message: "Unable to Delete Inventory Details" });
    }
    
    return res.status(200).json({ inventory });
};
