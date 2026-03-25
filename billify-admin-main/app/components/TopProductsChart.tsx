"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TopProductData {
  product: string;
  sales: number;
}

const chartData: TopProductData[] = [
  { product: "Milk", sales: 120 },
  { product: "Bread", sales: 95 },
  { product: "Rice", sales: 70 },
  { product: "Eggs", sales: 60 },
  { product: "Coffee", sales: 45 },
];

export default function TopProductsChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200">
      {/* Card Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
        <p className="text-sm text-gray-500 mt-1">Best performing items by sales volume</p>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="h-72 w-full" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="product"
                stroke="#d1d5db"
                style={{ fontSize: "12px", fontWeight: "500" }}
              />
              <YAxis
                stroke="#d1d5db"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  padding: "8px 12px",
                }}
                formatter={(value) => [`${value} units`, "Sales"]}
                labelStyle={{ color: "#111827", fontSize: "12px" }}
              />
              <Bar
                dataKey="sales"
                fill="#3b82f6"
                barSize={20}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
