import { useQuery } from "@tanstack/react-query";
import { Bell, Clock, Wifi } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
}

export default function Header({ title, description }: HeaderProps) {
  const { data: alerts } = useQuery({
    queryKey: ['/api/alerts/unresolved'],
    retry: false,
  });

  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <p className="text-slate-600">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Alert Badge */}
          <div className="relative">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            {alerts && alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></span>
            )}
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600">System Online</span>
          </div>
          
          {/* Last Updated */}
          <div className="text-sm text-slate-500 flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
