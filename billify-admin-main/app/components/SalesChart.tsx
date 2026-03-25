"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatINRValue } from "@/lib/currency";

interface ChartData {
  day: string;
  revenue: number;
}

const chartData: ChartData[] = [
  { day: "Mon", revenue: 52000 },
  { day: "Tue", revenue: 48000 },
  { day: "Wed", revenue: 63000 },
  { day: "Thu", revenue: 59000 },
  { day: "Fri", revenue: 71000 },
  { day: "Sat", revenue: 83000 },
  { day: "Sun", revenue: 76000 },
];

export default function SalesChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200">
      {/* Card Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Revenue Last 7 Days</h2>
        <p className="text-sm text-gray-500 mt-1">Daily revenue trend analysis</p>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="h-72 w-full" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} opacity={0.5} />
              <XAxis
                dataKey="day"
                stroke="#47494d"
                style={{ fontSize: "12px", fontWeight: "500" }}
              />
              <YAxis
                stroke="#47494d"
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
                formatter={(value) => [`₹${formatINRValue(value as number)}`, "Revenue"]}
                labelStyle={{ color: "#111827", fontSize: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
