// src/models/InventoryModel.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const inventorySchema = new Schema({
    productName: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    currentStockQuantity: {
        type: Number,
        required: true,
    },
    reorderlevel: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true
});

export default mongoose.model("InventoryModel", inventorySchema);
