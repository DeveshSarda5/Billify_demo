import { Product } from "@/lib/mockData";

interface LowStockAlertProps {
  products: Product[];
  threshold?: number;
}

export default function LowStockAlert({
  products,
  threshold = 10,
}: LowStockAlertProps) {
  const lowStockProducts = products.filter((p) => p.stock < threshold);

  if (lowStockProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 font-bold text-sm">OK</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">All Good!</h3>
            <p className="text-sm text-gray-500 mt-1">All products have sufficient stock</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200">
      <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>Low Stock Alert</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {lowStockProducts.length} {lowStockProducts.length === 1 ? "product" : "products"} with stock below {threshold} units
          </p>
        </div>
        <span className="text-sm font-semibold bg-red-100 text-red-800 px-3 py-1 rounded-full">
          {lowStockProducts.length} items
        </span>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {lowStockProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">{product.stock}</div>
                <div className="text-xs text-gray-500">units</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            Restock these items soon to maintain adequate inventory levels.
          </p>
        </div>
      </div>
    </div>
  );
}
