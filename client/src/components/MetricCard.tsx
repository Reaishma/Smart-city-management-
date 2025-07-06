import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendType: "positive" | "negative" | "neutral";
  iconColor: "blue" | "yellow" | "green" | "emerald" | "red";
}

export default function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendType, 
  iconColor 
}: MetricCardProps) {
  const iconColors = {
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
    emerald: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
  };

  const trendColors = {
    positive: "text-success",
    negative: "text-error",
    neutral: "text-slate-500",
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          iconColors[iconColor]
        )}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={cn(
          "text-sm font-medium",
          trendColors[trendType]
        )}>
          {trend}
        </span>
        <span className="text-slate-500 text-sm ml-1">
          {trendType === "neutral" ? "current" : "vs last month"}
        </span>
      </div>
    </div>
  );
}
