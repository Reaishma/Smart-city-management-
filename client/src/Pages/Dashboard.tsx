import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import TrafficChart from "@/components/charts/TrafficChart";
import EnergyChart from "@/components/charts/EnergyChart";
import AlertCard from "@/components/AlertCard";
import ActivityFeed from "@/components/ActivityFeed";
import PredictionCard from "@/components/PredictionCard";
import { Users, Zap, Car, Leaf } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    retry: false,
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/alerts/unresolved'],
    retry: false,
  });

  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ['/api/predictions/latest'],
    retry: false,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/activity'],
    retry: false,
  });

  useEffect(() => {
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      window.location.reload();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (metricsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="City Overview Dashboard"
          description="Real-time monitoring and analytics for smart city operations"
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Population"
              value={metrics?.totalPopulation ? (metrics.totalPopulation / 1000000).toFixed(1) + 'M' : '0'}
              icon={<Users className="w-6 h-6" />}
              trend="+2.1%"
              trendType="positive"
              iconColor="blue"
            />
            <MetricCard
              title="Energy Usage"
              value={metrics?.energyConsumption ? Math.round(metrics.energyConsumption) + ' MW' : '0 MW'}
              icon={<Zap className="w-6 h-6" />}
              trend="-1.2%"
              trendType="negative"
              iconColor="yellow"
            />
            <MetricCard
              title="Traffic Flow"
              value={metrics?.trafficFlow ? Math.round(metrics.trafficFlow) + '%' : '0%'}
              icon={<Car className="w-6 h-6" />}
              trend="+5.7%"
              trendType="positive"
              iconColor="green"
            />
            <MetricCard
              title="Air Quality"
              value={metrics?.airQuality || 'Good'}
              icon={<Leaf className="w-6 h-6" />}
              trend="AQI: 42"
              trendType="neutral"
              iconColor="emerald"
            />
          </div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <TrafficChart />
            <EnergyChart />
          </div>

          {/* Real-time Monitoring Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Live Traffic Map */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Live Traffic Map</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600">Live</span>
                </div>
              </div>
              <div className="relative bg-slate-100 rounded-lg h-80 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1519302959554-a75be0afc82a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500" 
                  alt="City traffic map overview" 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <div className="bg-success text-white px-3 py-1 rounded-full text-xs font-medium">
                    Downtown: Low
                  </div>
                  <div className="bg-warning text-white px-3 py-1 rounded-full text-xs font-medium">
                    Highway 101: Medium
                  </div>
                  <div className="bg-error text-white px-3 py-1 rounded-full text-xs font-medium">
                    Bridge Ave: High
                  </div>
                </div>
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">System Alerts</h3>
                <button className="text-primary hover:text-primary/80 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {alertsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-slate-500">Loading alerts...</p>
                  </div>
                ) : alerts && alerts.length > 0 ? (
                  alerts.slice(0, 3).map((alert: any) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>No active alerts</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity and Predictive Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent Activity</h3>
              <ActivityFeed activities={activities} isLoading={activitiesLoading} />
            </div>

            {/* Predictive Analytics */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Predictive Analytics</h3>
              <div className="space-y-6">
                {predictionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-slate-500">Loading predictions...</p>
                  </div>
                ) : predictions && predictions.length > 0 ? (
                  predictions.slice(0, 3).map((prediction: any) => (
                    <PredictionCard key={prediction.id} prediction={prediction} />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>No predictions available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
