"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatINRValue } from "@/lib/currency";

interface GrowthData {
  month: string;
  totalCustomers: number;
  newCustomers: number;
}

interface Props {
  data: GrowthData[];
}

export default function CustomerGrowthChart({ data }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200">
      {/* Card Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Customer Growth Over Time</h2>
        <p className="text-sm text-gray-500 mt-1">Monthly customer acquisition trends</p>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="h-72 w-full" style={{ minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} opacity={0.5} />
              <XAxis
                dataKey="month"
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
                labelStyle={{ color: "#111827", fontSize: "12px" }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="totalCustomers"
                stroke="#2563eb"
                strokeWidth={3}
                name="Total Customers"
                dot={false}
                activeDot={{ r: 6, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="newCustomers"
                stroke="#10b981"
                strokeWidth={3}
                name="New Customers"
                dot={false}
                activeDot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
