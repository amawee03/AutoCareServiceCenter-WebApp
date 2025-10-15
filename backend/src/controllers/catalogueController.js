import ServicePackage from '../models/ServicePackage.js';
import mongoose from 'mongoose';


export async function getAllPackages (req,res){
    try{
        const sPackage = await ServicePackage.find();
        res.status(200).json(sPackage);
    }catch(error){
        console.error("Error in getAllPackages controller",error);
        res.status(500).json({message:"Internal server error"});
    }
 }

 export async function getPackageById(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid package id" });
        }

        const servicePack = await ServicePackage.findById(id);
        if (!servicePack) {
            return res.status(404).json({ message: "Package not found" });
        }

        res.status(200).json(servicePack);
    } catch (error) {
        console.error("Error in getPackageById controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

 export async function createPackage (req,res){
     try{
        const {
             pkgName,
             description,
             category,
             price,
             duration,
            features,
            tags,
             image,
             status
         } = req.body || {};

         if(!pkgName || !description || !category || price === undefined || !duration){
             return res.status(400).json({ message: "pkgName, description, category, price and duration are required" });
         }

        
        const normalizedPrice = Number(price);
        const normalizedFeatures = Array.isArray(features) ? features : (features ? [features] : []);
        const normalizedTags = Array.isArray(tags) ? tags : (tags ? [tags] : []);
        const normalizedImage = req.file ? `/uploads/${req.file.filename}` : (image || "");

        const created = await ServicePackage.create({
            pkgName,
            description,
            category,
            price: normalizedPrice,
            duration,
            features: normalizedFeatures,
            tags: normalizedTags,
            image: normalizedImage,
            status
        });
         return res.status(201).json(created);
     }catch(error){
         console.error("Error in createPackage controller", error);
         return res.status(500).json({ message: "Internal server error" });
     }
 } 

 export async function updatePackage (req,res){
    try{
        const { id } = req.params;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({ message: "Invalid package id" });
        }

        const update = req.body || {};
       
        if (update.price !== undefined) {
            update.price = Number(update.price);
        }
        if (update.features !== undefined) {
            update.features = Array.isArray(update.features) ? update.features : (update.features ? [update.features] : []);
        }
        if (update.tags !== undefined) {
            update.tags = Array.isArray(update.tags) ? update.tags : (update.tags ? [update.tags] : []);
        }
        if (req.file) {
            update.image = `/uploads/${req.file.filename}`;
        }
        const updated = await ServicePackage.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if(!updated){
            return res.status(404).json({ message: "Service package not found" });
        }
        return res.status(200).json(updated);
    }catch(error){
        console.error("Error in updatePackage controller", error);
        return res.status(500).json({ message: "Internal server error" });
    }
 }

 export async function deletePackage(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid package id" });
    }

    const deleted = await ServicePackage.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Service package not found" });
    }

    return res.status(200).json({ message: "Service package deleted successfully" });
  } catch (error) {
    console.error("Error in deletePackage controller", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}