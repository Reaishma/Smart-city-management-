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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Database, Users, Activity, RefreshCw, Download, Trash2, Eye } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function AdminPanel() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/activity'],
    retry: false,
  });

  const { data: trafficData } = useQuery({
    queryKey: ['/api/traffic'],
    retry: false,
  });

  const { data: energyData } = useQuery({
    queryKey: ['/api/energy'],
    retry: false,
  });

  const { data: environmentalData } = useQuery({
    queryKey: ['/api/environmental'],
    retry: false,
  });

  const { data: populationData } = useQuery({
    queryKey: ['/api/population'],
    retry: false,
  });

  const { data: alerts } = useQuery({
    queryKey: ['/api/alerts'],
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

  const generatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/predictions/generate', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to generate predictions');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Predictions Generated",
        description: "New predictions have been generated successfully.",
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
        title: "Generation Failed",
        description: "Failed to generate predictions.",
        variant: "destructive",
      });
    },
  });

  const refreshDataMutation = useMutation({
    mutationFn: async () => {
      // Refresh all data by invalidating queries
      await queryClient.invalidateQueries();
    },
    onSuccess: () => {
      toast({
        title: "Data Refreshed",
        description: "All system data has been refreshed.",
      });
    },
  });

  const getDataCount = (data: any[]) => data?.length || 0;
  const getLastUpdate = (data: any[]) => {
    if (!data || data.length === 0) return 'Never';
    return new Date(data[0].timestamp || data[0].createdAt).toLocaleString();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const systemStats = {
    totalRecords: getDataCount(trafficData) + getDataCount(energyData) + getDataCount(environmentalData) + getDataCount(populationData),
    totalActivities: getDataCount(activities),
    totalAlerts: getDataCount(alerts),
    systemUptime: '99.9%'
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="System Administration"
          description="System configuration, data management, and monitoring controls"
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Records</p>
                    <p className="text-2xl font-bold text-slate-800">{systemStats.totalRecords.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">System Activities</p>
                    <p className="text-2xl font-bold text-slate-800">{systemStats.totalActivities}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">System Alerts</p>
                    <p className="text-2xl font-bold text-slate-800">{systemStats.totalAlerts}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">System Uptime</p>
                    <p className="text-2xl font-bold text-slate-800">{systemStats.systemUptime}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="data" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="data">Data Management</TabsTrigger>
                <TabsTrigger value="activities">System Activities</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => refreshDataMutation.mutate()}
                  disabled={refreshDataMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {refreshDataMutation.isPending ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                <Button 
                  onClick={() => generatePredictionsMutation.mutate()}
                  disabled={generatePredictionsMutation.isPending}
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {generatePredictionsMutation.isPending ? 'Generating...' : 'Generate Predictions'}
                </Button>
              </div>
            </div>

            <TabsContent value="data" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle>Data Sources Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">Traffic Data</p>
                          <p className="text-sm text-slate-500">Real-time traffic monitoring</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{getDataCount(trafficData)} records</p>
                          <p className="text-xs text-slate-500">{getLastUpdate(trafficData)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">Energy Data</p>
                          <p className="text-sm text-slate-500">Grid consumption and generation</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{getDataCount(energyData)} records</p>
                          <p className="text-xs text-slate-500">{getLastUpdate(energyData)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">Environmental Data</p>
                          <p className="text-sm text-slate-500">Air quality and climate sensors</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{getDataCount(environmentalData)} records</p>
                          <p className="text-xs text-slate-500">{getLastUpdate(environmentalData)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">Population Data</p>
                          <p className="text-sm text-slate-500">Demographics and statistics</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{getDataCount(populationData)} records</p>
                          <p className="text-xs text-slate-500">{getLastUpdate(populationData)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export All Data
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Sensors
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        System Configuration
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        Database Optimization
                      </Button>
                      <Button className="w-full justify-start" variant="outline" disabled>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cleanup Old Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent System Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-slate-500">Loading activities...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>Module</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activities?.slice(0, 10).map((activity: any) => (
                          <TableRow key={activity.id}>
                            <TableCell className="font-medium">{activity.action}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{activity.module}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{activity.description}</TableCell>
                            <TableCell>{new Date(activity.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!activities || activities.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                              No activities found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Database Status</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">API Services</span>
                        <Badge className="bg-green-100 text-green-800">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Data Simulation</span>
                        <Badge className="bg-green-100 text-green-800">Running</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Predictive Models</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Storage Usage</span>
                        <span className="text-sm">45% (2.1 GB)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Maintenance Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Database backup</span>
                        <Badge variant="outline">Scheduled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Log rotation</span>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Model retraining</span>
                        <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Cache cleanup</span>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
