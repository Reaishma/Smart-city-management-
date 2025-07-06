import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Building, 
  Car, 
  Zap, 
  Leaf, 
  Users, 
  BarChart3, 
  Database, 
  Download, 
  Settings, 
  Bell,
  LogOut,
  Gauge
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: <Gauge className="w-5 h-5" /> },
  ];

  const moduleItems = [
    { path: "/traffic", label: "Traffic Management", icon: <Car className="w-5 h-5" /> },
    { path: "/energy", label: "Energy Grid", icon: <Zap className="w-5 h-5" /> },
    { path: "/environmental", label: "Environmental", icon: <Leaf className="w-5 h-5" /> },
    { path: "/population", label: "Population", icon: <Users className="w-5 h-5" /> },
  ];

  const analyticsItems = [
    { path: "/analytics", label: "Predictive Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { path: "/analytics?tab=historical", label: "Historical Data", icon: <Database className="w-5 h-5" /> },
    { path: "/analytics?tab=export", label: "Data Export", icon: <Download className="w-5 h-5" /> },
  ];

  const systemItems = [
    { path: "/admin", label: "Admin Panel", icon: <Settings className="w-5 h-5" /> },
    { path: "/alerts", label: "Alert System", icon: <Bell className="w-5 h-5" /> },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col border-r border-slate-200">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">SmartCity</h1>
            <p className="text-sm text-slate-500">Management Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-primary text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              City Modules
            </h3>
            <div className="mt-2 space-y-1">
              {moduleItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Analytics
            </h3>
            <div className="mt-2 space-y-1">
              {analyticsItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path.split("?")[0])
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              System
            </h3>
            <div className="mt-2 space-y-1">
              {systemItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800">
              Admin
            </p>
            <p className="text-xs text-slate-500">
              System Administrator
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/api/logout'}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
