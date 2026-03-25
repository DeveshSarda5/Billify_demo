import { mockBills } from "@/lib/mockData";
import { formatINR } from "@/lib/currency";

export default function RecentSalesTable() {
  const recentSales = mockBills.slice(0, 8);

  // Function to determine status badge style
  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; text: string }> = {
      completed: { bg: "bg-green-100", text: "text-green-800" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
      failed: { bg: "bg-red-100", text: "text-red-800" },
    };

    const style = statusStyles[status] || statusStyles.completed;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <p className="text-sm text-gray-500 mt-1">Latest customer sales data</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Bill ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentSales.map((bill, index) => {
              // Alternate status for mock data
              const statuses = ["completed", "completed", "completed", "pending", "completed", "completed", "completed", "completed"];
              const status = statuses[index] || "completed";
              
              return (
                <tr
                  key={bill.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                    {bill.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {bill.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bill.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {bill.items.length} items
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                    {formatINR(bill.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(status)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
