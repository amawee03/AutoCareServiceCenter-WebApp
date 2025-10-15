import Vehicle from "../models/Vehicle.js";

// Get a single vehicle by id for the logged-in user
export async function getVehicleById(req, res) {
    try {
        const { id } = req.params;
        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const vehicle = await Vehicle.findOne({ _id: id, owner: req.session.userId });
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        return res.status(200).json(vehicle);
    } catch (error) {
        console.error("Error fetching vehicle by id:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Get all vehicles for the logged-in user
export async function getUserVehicles(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const vehicles = await Vehicle.find({ owner: req.session.userId });
        res.status(200).json(vehicles);
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Add a new vehicle for the logged-in user
export async function createVehicle(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const { make, model, year, licensePlate } = req.body;
        const newVehicle = new Vehicle({
            make,
            model,
            year,
            licensePlate,
            owner: req.session.userId
        });

        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "License plate already exists" });
        }
        console.error("Error creating vehicle:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Update a vehicle (only if owned by user)
export async function updateVehicle(req, res) {
    try {
        const { id } = req.params;
        const { make, model, year, licensePlate } = req.body;

        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const vehicle = await Vehicle.findOne({ _id: id, owner: req.session.userId });
        if (!vehicle) {
            return res.status(403).json({ message: "Vehicle not found or access denied" });
        }

        vehicle.make = make || vehicle.make;
        vehicle.model = model || vehicle.model;
        vehicle.year = year || vehicle.year;
        vehicle.licensePlate = licensePlate || vehicle.licensePlate;

        await vehicle.save();
        res.status(200).json(vehicle);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "License plate already exists" });
        }
        console.error("Error updating vehicle:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Delete a vehicle (only if owned by user)
export async function deleteVehicle(req, res) {
    try {
        const { id } = req.params;

        if (!req.session.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const result = await Vehicle.deleteOne({ _id: id, owner: req.session.userId });
        if (result.deletedCount === 0) {
            return res.status(403).json({ message: "Vehicle not found or access denied" });
        }

        res.status(200).json({ message: "Vehicle deleted successfully" });
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}