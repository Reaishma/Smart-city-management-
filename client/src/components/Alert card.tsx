import { cn } from "@/lib/utils";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

interface AlertCardProps {
  alert: {
    id: number;
    type: string;
    title: string;
    message: string;
    severity: string;
    createdAt: string;
  };
}

export default function AlertCard({ alert }: AlertCardProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-4 h-4 text-white" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-white" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-white" />;
      default:
        return <Info className="w-4 h-4 text-white" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-error";
      case "warning":
        return "bg-warning";
      case "success":
        return "bg-success";
      default:
        return "bg-primary";
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className={cn("alert-card", alert.type)}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        getAlertColor(alert.type)
      )}>
        {getAlertIcon(alert.type)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{alert.title}</p>
        <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
        <p className="text-xs text-slate-500 mt-1">{timeAgo(alert.createdAt)}</p>
      </div>
    </div>
  );
}
