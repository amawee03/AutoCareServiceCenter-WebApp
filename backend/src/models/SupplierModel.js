// src/models/SupplierModel.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const supplierSchema = new Schema({
    supplierId: {
        type: String,
        required: true,
        unique: true,
    },
    supplierName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

export default mongoose.model("SupplierModel", supplierSchema);