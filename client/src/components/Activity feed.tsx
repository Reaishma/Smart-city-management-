import { User, Database, BarChart3, Settings } from "lucide-react";

interface ActivityFeedProps {
  activities: any[];
  isLoading: boolean;
}

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  const getActivityIcon = (module: string) => {
    switch (module) {
      case "traffic":
      case "energy":
      case "environmental":
      case "population":
        return <User className="w-4 h-4 text-blue-600" />;
      case "system":
        return <Database className="w-4 h-4 text-green-600" />;
      case "analytics":
        return <BarChart3 className="w-4 h-4 text-yellow-600" />;
      case "admin":
        return <Settings className="w-4 h-4 text-purple-600" />;
      default:
        return <User className="w-4 h-4 text-blue-600" />;
    }
  };

  const getActivityColor = (module: string) => {
    switch (module) {
      case "traffic":
      case "energy":
      case "environmental":
      case "population":
        return "bg-blue-100";
      case "system":
        return "bg-green-100";
      case "analytics":
        return "bg-yellow-100";
      case "admin":
        return "bg-purple-100";
      default:
        return "bg-blue-100";
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-slate-500">Loading activities...</p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No recent activities</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.slice(0, 5).map((activity) => (
        <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.module)}`}>
            {getActivityIcon(activity.module)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800">{activity.description}</p>
            <p className="text-xs text-slate-500">{activity.module} • {timeAgo(activity.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
