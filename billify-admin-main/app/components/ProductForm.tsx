"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductFormData {
  name: string;
  brand: string;
  barcode: string;
  price: string;
  stock: string;
}

export default function ProductForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    brand: "",
    barcode: "",
    price: "",
    stock: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.name ||
      !formData.brand ||
      !formData.barcode ||
      !formData.price ||
      !formData.stock
    ) {
      alert("Please fill in all fields");
      return;
    }

    // Show success message
    setSubmitted(true);

    // Reset form
    setFormData({
      name: "",
      brand: "",
      barcode: "",
      price: "",
      stock: "",
    });

    // Redirect to products page after 2 seconds
    setTimeout(() => {
      router.push("/products");
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
      {submitted && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg border border-green-300">
          Product added successfully! Redirecting to products page...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="e.g., Apple"
          />
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-900">
            Brand
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="e.g., Fresh Farms"
          />
        </div>

        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-900">
            Barcode
          </label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="e.g., 1234567890123"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-900">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="e.g., 2.99"
            />
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-900">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="e.g., 100"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Product
          </button>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="flex-1 bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
