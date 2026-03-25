"use client";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesBreakdownData {
  category: string;
  value: number;
}

const chartData: SalesBreakdownData[] = [
  { category: "Groceries", value: 35 },
  { category: "Beverages", value: 25 },
  { category: "Snacks", value: 20 },
  { category: "Household", value: 20 },
];

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"];

export default function SalesBreakdownChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200">
      {/* Card Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Sales by Category</h2>
        <p className="text-sm text-gray-500 mt-1">Distribution across product categories</p>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="h-64 w-full" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  padding: "8px 12px",
                }}
                formatter={(value) => `${value}%`}
                labelStyle={{ color: "#111827", fontSize: "12px" }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "12px",
                }}
                iconType="circle"
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ value }) => `${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
