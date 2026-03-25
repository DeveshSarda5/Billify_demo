import { Product } from "@/lib/mockData";

interface ProductTableProps {
  products: Product[];
}

export default function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Brand
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Barcode
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Price
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Stock
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{product.brand}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{product.barcode}</td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                ${product.price.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 50
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {product.stock} units
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
