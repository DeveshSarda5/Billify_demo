import { mockCustomers, customerGrowthData, customerSegmentationData } from "@/lib/mockData";
import CustomerStatsCards from "../components/CustomerStatsCards";
import CustomerGrowthChart from "../components/CustomerGrowthChart";
import CustomerSegmentationChart from "../components/CustomerSegmentationChart";
import TopCustomersTable from "../components/TopCustomersTable";

export default function CustomerInsights() {
  // Sort customers by total spend for top customers display
  const sortedCustomers = [...mockCustomers].sort((a, b) => b.totalSpend - a.totalSpend);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">Customer Insights</h1>
        <p className="text-gray-500">Understand customer behavior and spending patterns</p>
      </div>

      {/* Stats Cards */}
      <div>
        <CustomerStatsCards />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerGrowthChart data={customerGrowthData} />
        <CustomerSegmentationChart data={customerSegmentationData} />
      </div>

      {/* Top Customers Table */}
      <div>
        <TopCustomersTable customers={sortedCustomers} />
      </div>
    </div>
  );
}
