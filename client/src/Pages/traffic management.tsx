import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Car, MapPin, Clock, TrendingUp, AlertTriangle, Download } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function TrafficManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: trafficData, isLoading: trafficLoading } = useQuery({
    queryKey: ['/api/traffic'],
    retry: false,
  });

  const { data: predictions } = useQuery({
    queryKey: ['/api/predictions', 'traffic'],
    retry: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const exportMutation = useMutation({
    mutationFn: async () => {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
      const response = await fetch(`/api/export/traffic?startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Export failed');
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `traffic_data_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Export Successful",
        description: "Traffic data has been exported successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Export Failed",
        description: "Failed to export traffic data.",
        variant: "destructive",
      });
    },
  });

  const processFlowData = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    const hourlyData = data.reduce((acc: any, item: any) => {
      const hour = new Date(item.timestamp).getHours();
      const timeLabel = `${hour}:00`;
      
      if (!acc[timeLabel]) {
        acc[timeLabel] = { time: timeLabel, values: [] };
      }
      acc[timeLabel].values.push(item.flowRate);
      return acc;
    }, {});

    return Object.values(hourlyData).map((item: any) => ({
      time: item.time,
      flowRate: Math.round(item.values.reduce((a: number, b: number) => a + b, 0) / item.values.length)
    }));
  };

  const processLocationData = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    const locationData = data.reduce((acc: any, item: any) => {
      if (!acc[item.location]) {
        acc[item.location] = { location: item.location, values: [] };
      }
      acc[item.location].values.push(item.flowRate);
      return acc;
    }, {});

    return Object.values(locationData).map((item: any) => ({
      location: item.location.split(' ').slice(0, 2).join(' '),
      avgFlow: Math.round(item.values.reduce((a: number, b: number) => a + b, 0) / item.values.length)
    }));
  };

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || trafficLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading traffic management...</p>
        </div>
      </div>
    );
  }

  const flowData = processFlowData(trafficData || []);
  const locationData = processLocationData(trafficData || []);
  const recentData = trafficData?.slice(0, 10) || [];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Traffic Management System"
          description="Real-time traffic monitoring and flow optimization"
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Average Flow</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {recentData.length > 0 
                        ? Math.round(recentData.reduce((acc: number, item: any) => acc + item.flowRate, 0) / recentData.length) + '%'
                        : '0%'
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Active Locations</p>
                    <p className="text-2xl font-bold text-slate-800">{locationData.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Peak Hour</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {flowData.length > 0 
                        ? flowData.reduce((max, item) => item.flowRate > max.flowRate ? item : max, flowData[0]).time
                        : '--:--'
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Efficiency</p>
                    <p className="text-2xl font-bold text-slate-800">89%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
                <TabsTrigger value="predictions">Predictions</TabsTrigger>
              </TabsList>
              <Button 
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {exportMutation.isPending ? 'Exporting...' : 'Export Data'}
              </Button>
            </div>

            <TabsContent value="overview" className="space-y-6">
              {/* Flow Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Flow Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={flowData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${value}%`} />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Flow Rate']}
                          contentStyle={{ 
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="flowRate" 
                          stroke="hsl(217, 91%, 60%)" 
                          strokeWidth={2}
                          dot={{ fill: "hsl(217, 91%, 60%)", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Traffic Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentData.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-800">{item.location}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getCongestionColor(item.congestionLevel)}>
                            {item.congestionLevel}
                          </Badge>
                          <span className="text-sm font-medium">{Math.round(item.flowRate)}%</span>
                        </div>
                      </div>
                    ))}
                    {recentData.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <p>No traffic data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic by Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={locationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="location" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${value}%`} />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Average Flow']}
                          contentStyle={{ 
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar 
                          dataKey="avgFlow" 
                          fill="hsl(217, 91%, 60%)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions && predictions.length > 0 ? (
                      predictions.filter((p: any) => p.module === 'traffic').map((prediction: any) => (
                        <div key={prediction.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-slate-800">Traffic Flow Prediction</h4>
                            <Badge variant="outline">{prediction.timeHorizon}h ahead</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-slate-600">
                              Expected flow: {Math.round(prediction.predictedValue)}%
                            </span>
                          </div>
                          <div className="mt-2 flex items-center space-x-2">
                            <div className="flex-1 bg-green-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${Math.round(prediction.confidence * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-green-600">
                              {Math.round(prediction.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No traffic predictions available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
