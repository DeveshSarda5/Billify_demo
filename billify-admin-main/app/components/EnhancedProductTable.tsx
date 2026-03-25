"use client";

import { Product } from "@/lib/mockData";
import { formatCurrency } from "@/lib/currency";

interface EnhancedProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
}

export default function EnhancedProductTable({
  products,
  onEdit,
  onDelete,
}: EnhancedProductTableProps) {
  const calculateProfit = (product: Product) => product.price - product.costPrice;
  const getProfitColor = (profit: number) => {
    if (profit > 0) return "text-green-600 font-semibold";
    if (profit < 0) return "text-red-600 font-semibold";
    return "text-gray-600";
  };

  return (
    <div className="overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Product Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Brand
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Cost Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Selling Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Profit
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => {
            const profit = calculateProfit(product);
            return (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{product.brand}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                      product.stock > 50
                        ? "bg-green-100 text-green-800"
                        : product.stock > 20
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock} units
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                  {formatCurrency(product.costPrice)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                  {formatCurrency(product.price)}
                </td>
                <td className={`px-6 py-4 text-sm font-semibold ${getProfitColor(profit)}`}>
                  {formatCurrency(profit)}
                </td>
                <td className="px-6 py-4 text-sm space-x-2 flex">
                  <button
                    onClick={() => onEdit?.(product)}
                    className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-150"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete?.(product.id)}
                    className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-150"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
