interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    percentage: number;
    isPositive: boolean;
  };
  borderColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  borderColor = "border-gray-200",
}: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl border-l-4 border ${borderColor} shadow-sm hover:shadow-md p-6 transition-shadow duration-200`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-3">{value}</p>
          
          {trend && (
            <div
              className={`inline-flex items-center space-x-1 text-xs font-semibold ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.percentage)}% today</span>
            </div>
          )}
        </div>
        
        <div className="shrink-0">{icon}</div>
      </div>
    </div>
  );
}
