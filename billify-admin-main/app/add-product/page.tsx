import ProductForm from "../components/ProductForm";

export default function AddProductPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">Add Product</h1>
        <p className="text-gray-500">Create a new product entry in your inventory.</p>
      </div>

      {/* Product Form Card */}
      <ProductForm />
    </div>
  );
}
