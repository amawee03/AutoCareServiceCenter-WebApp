// ServicePackageForm.jsx
import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import axios from "axios";

export function ServicePackageForm({ servicePackage, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    pkgName: "",
    description: "",
    category: "",
    price: "",
    duration: "",
    features: [],
    tags: [],
    includedServices: [],
    status: "active",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

 
  const [newFeature, setNewFeature] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newService, setNewService] = useState("");

 
  useEffect(() => {
    if (servicePackage) {
      setForm({
        pkgName: servicePackage.pkgName || "",
        description: servicePackage.description || "",
        category: servicePackage.category || "",
        price: servicePackage.price || "",
        duration: servicePackage.duration || "",
        features: servicePackage.features || [],
        tags: servicePackage.tags || [],
        includedServices: servicePackage.includedServices || [],
        status: servicePackage.status || "active",
        image: null, // reset file input
      });
      if (servicePackage.image) {
        setImagePreview(`http://localhost:5001/${servicePackage.image}`);
      }
    }
  }, [servicePackage]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.pkgName.trim()) newErrors.pkgName = "Package name is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    
    
    const price = parseFloat(form.price);
    if (!form.price || isNaN(price) || price < 500) {
      newErrors.price = "Price must be at least Rs. 500";
    }
    
    const duration = parseInt(form.duration);
    if (!form.duration || isNaN(duration) || duration < 15) {
      newErrors.duration = "Duration must be at least 15 minutes";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    
    if ((name === 'price' || name === 'duration') && value.length > 5) {
      return; 
    }
    
    setForm((prev) => ({ ...prev, [name]: value }));
    
   
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleArrayChange = (e, field) => {
    const values = e.target.value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    setForm((prev) => ({ ...prev, [field]: values }));
  };


  const addItem = (field, value, setter) => {
    if (value.trim() && !form[field].includes(value.trim())) {
      setForm((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter("");
    }
  };

  const removeItem = (field, index) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e, field, value, setter) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(field, value, setter);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }
      
      if (file.size > maxSize) {
        alert("Image size should be less than 5MB");
        return;
      }
      
      setForm((prev) => ({ ...prev, image: file }));
      
      
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setForm((prev) => ({ ...prev, image: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      
      
      Object.keys(form).forEach((key) => {
        if (key === 'image' && form[key]) {
          formData.append(key, form[key]);
        } else if (Array.isArray(form[key])) {
          
          formData.append(key, JSON.stringify(form[key]));
        } else if (form[key] !== null && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (servicePackage) {
        
        await axios.put(
          `http://localhost:5001/api/packages/${servicePackage._id}`,
          formData,
          config
        );
      } else {
        
        await axios.post("http://localhost:5001/api/packages", formData, config);
      }

      
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      onSubmit(); 
    } catch (err) {
      console.error("Error saving service package:", err);
      const errorMessage = err.response?.data?.message || "Failed to save service package";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {servicePackage ? "Edit Service Package" : "Create New Service Package"}
          </h2>
          <p className="text-gray-600">
            {servicePackage ? "Update your service package details below" : "Fill in the details to create a new service package"}
          </p>
        </div>

        
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Package Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pkgName"
                value={form.pkgName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2  bg-white focus:ring-red-500 focus:border-red-500 transition-colors ${
                  errors.pkgName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter package name"
              />
              {errors.pkgName && <p className="text-red-500 text-sm mt-1">{errors.pkgName}</p>}
            </div>

            {/* Category */}
            <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
            </label>
            <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2  bg-white focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
            >
                <option value="">-- Select a Category --</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Exterior ">Exterior </option>
                <option value="Interior & Detailing:">Interior & Detailing:</option>
                <option value="Specialized ">Specialized </option>
                <option value="Engine & Mechanical">Engine & Mechanical</option>
            </select>
            {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
            </div>

            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 bg-white focus:ring-red-500 focus:border-red-500 transition-colors resize-vertical ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Describe your service package in detail..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Pricing & Duration */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
            Pricing & Duration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (LKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="500"
                step="0.01"
                maxLength="5"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2  bg-white focus:ring-red-500 focus:border-red-500 transition-colors ${
                  errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="500.00"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              <p className="text-xs text-gray-500 mt-1">Minimum Rs. 500 (Max 5 digits)</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                min="15"
                maxLength="5"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2  bg-white focus:ring-red-500 focus:border-red-500 transition-colors ${
                  errors.duration ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="15"
              />
              {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              <p className="text-xs text-gray-500 mt-1">Minimum 15 minutes (Max 5 digits)</p>
            </div>
          </div>
        </div>

        {/* Enhanced Package Details */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
            Package Details
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Features */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Features
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'features', newFeature, setNewFeature)}
                    className="flex-1 px-3 py-2 border bg-white border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    placeholder="Add a feature"
                  />
                  <button
                    type="button"
                    onClick={() => addItem('features', newFeature, setNewFeature)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeItem('features', index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Press Enter or click Add to add features</p>
            </div>
            
            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'tags', newTag, setNewTag)}
                    className="flex-1 px-3 py-2 border bg-white border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={() => addItem('tags', newTag, setNewTag)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeItem('tags', index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Press Enter or click Add to add tags</p>
            </div>
            
            {/* Included Services */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Included Services
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'includedServices', newService, setNewService)}
                    className="flex-1 px-3 py-2 border bg-white border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    placeholder="Add a service"
                  />
                  <button
                    type="button"
                    onClick={() => addItem('includedServices', newService, setNewService)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.includedServices.map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => removeItem('includedServices', index)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Press Enter or click Add to add services</p>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
            Package Image
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Image
              </label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg px-6 py-4 text-center transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="text-gray-600">
                    <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm font-medium">Choose Image</span>
                  </div>
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove Image
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: JPEG, PNG, WebP. Max size: 5MB
              </p>
            </div>
            
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {servicePackage ? "Updating..." : "Creating..."}
              </div>
            ) : (
              servicePackage ? "Update Service Package" : "Create Service Package"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}