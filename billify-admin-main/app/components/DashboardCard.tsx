interface DashboardCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    percentage: number;
    isPositive: boolean;
  };
  children?: React.ReactNode;
  borderColor?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  children,
  borderColor = 'border-l-blue-500',
}: DashboardCardProps) {
  // For custom children, show title as header
  if (children) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    );
  }

  // For stat cards
  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow duration-200 p-6`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="shrink-0">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div
            className={`inline-flex items-center space-x-1 text-xs font-semibold ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.percentage)}% today</span>
          </div>
        </div>
      )}
    </div>
  );
}
