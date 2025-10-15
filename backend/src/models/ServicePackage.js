import mongoose from 'mongoose';

const ServicePackageSchema = new mongoose.Schema({
  pkgName: String,
  description: String,
  category: String,
  price: Number,
  // duration: Number,
  duration: { type: Number, required: true },
  features: [String],
  tags: [String],
  includedServices: [String],
  image: String,
  status: { type: String, enum: ["active","inactive"], default: "active" }
}, { timestamps: true });

const ServicePackage = mongoose.model("ServicePackage", ServicePackageSchema);
export default ServicePackage;