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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Leaf, Thermometer, Droplets, Volume2, TrendingUp, AlertTriangle, Download } from "lucide-react";

export default function Environmental() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: environmentalData, isLoading: environmentalLoading } = useQuery({
    queryKey: ['/api/environmental'],
    retry: false,
  });

  const { data: predictions } = useQuery({
    queryKey: ['/api/predictions', 'environmental'],
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
      const response = await fetch(`/api/export/environmental?startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Export failed');
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `environmental_data_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Export Successful",
        description: "Environmental data has been exported successfully.",
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
        description: "Failed to export environmental data.",
        variant: "destructive",
      });
    },
  });

  const processAQIData = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    const hourlyData = data.reduce((acc: any, item: any) => {
      const hour = new Date(item.timestamp).getHours();
      const timeLabel = `${hour}:00`;
      
      if (!acc[timeLabel]) {
        acc[timeLabel] = { time: timeLabel, values: [] };
      }
      acc[timeLabel].values.push(item.airQualityIndex);
      return acc;
    }, {});

    return Object.values(hourlyData).map((item: any) => ({
      time: item.time,
      aqi: Math.round(item.values.reduce((a: number, b: number) => a + b, 0) / item.values.length)
    }));
  };

  const processTemperatureData = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    const hourlyData = data.reduce((acc: any, item: any) => {
      const hour = new Date(item.timestamp).getHours();
      const timeLabel = `${hour}:00`;
      
      if (!acc[timeLabel]) {
        acc[timeLabel] = { time: timeLabel, temp: [], humidity: [] };
      }
      acc[timeLabel].temp.push(item.temperature || 0);
      acc[timeLabel].humidity.push(item.humidity || 0);
      return acc;
    }, {});

    return Object.values(hourlyData).map((item: any) => ({
      time: item.time,
      temperature: Math.round(item.temp.reduce((a: number, b: number) => a + b, 0) / item.temp.length * 10) / 10,
      humidity: Math.round(item.humidity.reduce((a: number, b: number) => a + b, 0) / item.humidity.length)
    }));
  };

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return { level: "Good", color: "bg-green-100 text-green-800" };
    if (aqi <= 100) return { level: "Moderate", color: "bg-yellow-100 text-yellow-800" };
    if (aqi <= 150) return { level: "Unhealthy for Sensitive", color: "bg-orange-100 text-orange-800" };
    if (aqi <= 200) return { level: "Unhealthy", color: "bg-red-100 text-red-800" };
    return { level: "Very Unhealthy", color: "bg-purple-100 text-purple-800" };
  };

  if (authLoading || environmentalLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading environmental monitoring...</p>
        </div>
      </div>
    );
  }

  const aqiData = processAQIData(environmentalData || []);
  const temperatureData = processTemperatureData(environmentalData || []);
  const recentData = environmentalData?.slice(0, 10) || [];
  const latest = recentData[0];
  const aqiInfo = latest ? getAQILevel(latest.airQualityIndex) : { level: "Unknown", color: "bg-gray-100 text-gray-800" };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Environmental Monitoring"
          description="Air quality, climate, and environmental sensor data tracking"
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Air Quality Index</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {latest ? latest.airQualityIndex : 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className={aqiInfo.color}>
                    {aqiInfo.level}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Temperature</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {latest ? Math.round(latest.temperature * 10) / 10 + '°C' : '0°C'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Thermometer className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Humidity</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {latest ? Math.round(latest.humidity) + '%' : '0%'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Noise Level</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {latest ? Math.round(latest.noiseLevel) + ' dB' : '0 dB'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="climate">Climate Data</TabsTrigger>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AQI Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Air Quality Index Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={aqiData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip 
                            formatter={(value) => [`${value}`, 'AQI']}
                            contentStyle={{ 
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="aqi" 
                            stroke="hsl(142, 71%, 45%)" 
                            fill="hsl(142, 71%, 45%)"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
{/* Pollutant Levels */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pollutant Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {latest && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">PM2.5</span>
                            <span className="text-sm">{Math.round(latest.pm25 * 10) / 10} μg/m³</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (latest.pm25 / 50) * 100)}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">PM10</span>
                            <span className="text-sm">{Math.round(latest.pm10 * 10) / 10} μg/m³</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (latest.pm10 / 100) * 100)}%` }}
                            ></div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Environmental Readings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentData.map((item: any, index: number) => {
                      const itemAQI = getAQILevel(item.airQualityIndex);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Leaf className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-800">
                                AQI: {item.airQualityIndex}
                              </p>
                              <p className="text-sm text-slate-500">
                                {new Date(item.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={itemAQI.color}>
                              {itemAQI.level}
                            </Badge>
                            <span className="text-sm font-medium">
                              {Math.round(item.temperature)}°C
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {recentData.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <p>No environmental data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="climate" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Temperature & Humidity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={temperatureData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="temperature" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          name="Temperature (°C)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="humidity" 
                          stroke="#06b6d4" 
                          strokeWidth={2}
                          name="Humidity (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions && predictions.length > 0 ? (
                      predictions.filter((p: any) => p.module === 'environmental').map((prediction: any) => (
                        <div key={prediction.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-slate-800">Air Quality Forecast</h4>
                            <Badge variant="outline">{prediction.timeHorizon}h ahead</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Leaf className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-slate-600">
                              Expected AQI: {Math.round(prediction.predictedValue)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center space-x-2">
                            <div className="flex-1 bg-purple-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${Math.round(prediction.confidence * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-purple-600">
                              {Math.round(prediction.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No environmental predictions available</p>
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
