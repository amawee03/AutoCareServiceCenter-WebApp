// src/controllers/PurchaseOrderController.js
import PurchaseOrder from "../models/PurchaseOrderModel.js";

// Get all purchase orders
export const getAllPurchaseOrders = async (req, res, next) => {
    try {
        const purchaseOrders = await PurchaseOrder.find().sort({ createdAt: -1 });
        return res.status(200).json({ orders: purchaseOrders });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Add purchase order
export const addPurchaseOrder = async (req, res, next) => {
    const { supplierName, productName, orderDate, unitPrice, quantityOrdered, status } = req.body;

    try {
        const TotalAmount = unitPrice * quantityOrdered; // Calculate total

        const newOrder = new PurchaseOrder({
            supplierName,
            productName,
            orderDate,
            unitPrice,
            quantityOrdered,
            TotalAmount,
            status
        });

        await newOrder.save();
        return res.status(201).json({ order: newOrder });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get by ID
export const getById = async (req, res, next) => {
    try {
        const purchaseOrder = await PurchaseOrder.findById(req.params.id);
        if (!purchaseOrder) return res.status(404).json({ message: "Purchase order not found" });

        return res.status(200).json({ order: purchaseOrder });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update purchase order
export const updatePurchaseOrder = async (req, res, next) => {
    const { supplierName, productName, orderDate, unitPrice, quantityOrdered, status } = req.body;

    try {
        const TotalAmount = unitPrice * quantityOrdered; // Recalculate on update

        const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
            req.params.id,
            {
                supplierName,
                productName,
                orderDate,
                unitPrice,
                quantityOrdered,
                TotalAmount,
                status
            },
            { new: true }
        );

        if (!updatedOrder) return res.status(404).json({ message: "Unable to Update Purchase Order Details" });

        return res.status(200).json({ order: updatedOrder });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Delete purchase order
export const deletePurchaseOrder = async (req, res, next) => {
    try {
        const deletedOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ message: "Unable to Delete Purchase Order Details" });

        return res.status(200).json({ order: deletedOrder });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
