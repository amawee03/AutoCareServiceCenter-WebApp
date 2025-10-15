// src/models/PurchaseOrderModel.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const purchaseOrderSchema = new Schema(
    {
        supplierName: {
            type: String,
            required: true,
        },
        productName: {
            type: String,
            required: true, 
        },
        orderDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        unitPrice: {
            type: Number,
            required: true, 
        },
        quantityOrdered: {
            type: Number,
            required: true,
        },
        TotalAmount: {
            type: Number,
            required: true, 
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Delivered', 'Cancel'],
            default: 'Pending'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("PurchaseOrderModel", purchaseOrderSchema);
