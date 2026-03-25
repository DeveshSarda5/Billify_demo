"use client";

import { useState } from "react";
import { Product } from "@/lib/mockData";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Omit<Product, "id">) => void;
}

interface FormData {
  name: string;
  brand: string;
  barcode: string;
  costPrice: string;
  price: string;
  stock: string;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onSubmit,
}: AddProductModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    brand: "",
    barcode: "",
    costPrice: "",
    price: "",
    stock: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.barcode.trim()) newErrors.barcode = "Barcode is required";
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0)
      newErrors.costPrice = "Valid cost price is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid selling price is required";
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = "Valid stock quantity is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const productData: Omit<Product, "id"> = {
      name: formData.name,
      brand: formData.brand,
      barcode: formData.barcode,
      costPrice: parseFloat(formData.costPrice),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    };

    console.log("Product submitted:", productData);
    onSubmit(productData);

    // Reset form
    setFormData({
      name: "",
      brand: "",
      barcode: "",
      costPrice: "",
      price: "",
      stock: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
          <p className="text-gray-500 text-sm mt-1">Fill in the details below</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`text-gray-500 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Apple"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className={`text-gray-500 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.brand ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Fresh Farms"
            />
            {errors.brand && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.brand}</p>
            )}
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Barcode
            </label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className={`text-gray-500 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.barcode ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., 1234567890123"
            />
            {errors.barcode && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.barcode}</p>
            )}
          </div>

          {/* Cost Price & Selling Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Cost Price (₹)
              </label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`text-gray-500 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.costPrice ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
              {errors.costPrice && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.costPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Selling Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`text-gray-500 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Stock
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className={`text-gray-500 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.stock ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0"
            />
            {errors.stock && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.stock}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-150"
            >
              Add Product
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-900 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
