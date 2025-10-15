import Supplier from "../models/SupplierModel.js";


// Get all suppliers
export const getAllSuppliers = async (req, res, next) => {
    let suppliers;
    try {
        suppliers = await Supplier.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!suppliers || suppliers.length === 0) {
        return res.status(404).json({ message: "Suppliers not found" });
    }
    
    return res.status(200).json({ suppliers });
};

// Add supplier — auto-generates supplierId
export const addSupplier = async (req, res, next) => {
    const { supplierName, email, phone } = req.body;

    let supplierId;
    try {
        // Find the most recently created supplier
        const lastSupplier = await Supplier.findOne().sort({ createdAt: -1 });

        let lastIdNum = 0;

        // Only parse if supplierId exists and is valid
        if (lastSupplier && lastSupplier.supplierId) {
            const parts = lastSupplier.supplierId.split('-');
            if (parts.length === 2 && !isNaN(parts[1])) {
                lastIdNum = parseInt(parts[1]);
            }
        }

        const newIdNum = (lastIdNum + 1).toString().padStart(3, '0');
        supplierId = `SUP-${newIdNum}`;

    } catch (err) {
        console.error("Error generating supplierId:", err);
        return res.status(500).json({ message: "Failed to generate supplier ID" });
    }

    let supplier;
    try {
        supplier = new Supplier({
            supplierId,      
            supplierName,
            email,
            phone
        });
        await supplier.save();
    } catch (err) {
        console.error("💥 Error saving supplier:", err);

        // Handle duplicate key error
        if (err.code === 11000) {
            return res.status(409).json({ message: "Supplier ID already exists. Please try again." });
        }

        return res.status(500).json({ message: "Server error", error: err.message });
    }

    return res.status(201).json({ supplier });
};

// Get by ID
export const getById = async (req, res, next) => {
    const id = req.params.id;
    let supplier;
    
    try {
        supplier = await Supplier.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
    }
    
    return res.status(200).json({ supplier });
};

// Get by Supplier ID
export const getBySupplierId = async (req, res, next) => {
    const supplierId = req.params.supplierId;
    let supplier;
    
    try {
        supplier = await Supplier.findOne({ supplierId: supplierId });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
    }
    
    return res.status(200).json({ supplier });
};

// Update supplier
export const updateSupplier = async (req, res, next) => {
    const id = req.params.id;
    const { supplierId, supplierName, email, phone } = req.body;
    let supplier;
    
    try {
        supplier = await Supplier.findByIdAndUpdate(
            id,
            {
                supplierId,
                supplierName,
                email,
                phone
            },
            { new: true }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!supplier) {
        return res.status(404).json({ message: "Unable to Update Supplier Details" });
    }
    
    return res.status(200).json({ supplier });
};

// Update supplier by Supplier ID
export const updateSupplierBySupplierId = async (req, res, next) => {
    const supplierId = req.params.supplierId;
    const { supplierName, email, phone } = req.body;
    let supplier;
    
    try {
        supplier = await Supplier.findOneAndUpdate(
            { supplierId: supplierId },
            {
                supplierName,
                email,
                phone
            },
            { new: true }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!supplier) {
        return res.status(404).json({ message: "Unable to Update Supplier Details" });
    }
    
    return res.status(200).json({ supplier });
};

// Delete supplier
export const deleteSupplier = async (req, res, next) => {
    const id = req.params.id;
    let supplier;
    
    try {
        supplier = await Supplier.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!supplier) {
        return res.status(404).json({ message: "Unable to Delete Supplier Details" });
    }
    
    return res.status(200).json({ supplier });
};

// Delete supplier by Supplier ID
export const deleteSupplierBySupplierId = async (req, res, next) => {
    const supplierId = req.params.supplierId;
    let supplier;
    
    try {
        supplier = await Supplier.findOneAndDelete({ supplierId: supplierId });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    
    if (!supplier) {
        return res.status(404).json({ message: "Unable to Delete Supplier Details" });
    }
    
    return res.status(200).json({ supplier });
};