import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Bell, CheckCircle, XCircle, Info, Clock, Search, Filter, RefreshCw } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AlertSystem() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/alerts'],
    retry: false,
  });

  const { data: unresolvedAlerts, isLoading: unresolvedLoading } = useQuery({
    queryKey: ['/api/alerts/unresolved'],
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

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      await apiRequest('PATCH', `/api/alerts/${alertId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts/unresolved'] });
      toast({
        title: "Alert Resolved",
        description: "The alert has been successfully resolved.",
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
        title: "Resolution Failed",
        description: "Failed to resolve the alert.",
        variant: "destructive",
      });
    },
  });

  const refreshAlertsMutation = useMutation({
    mutationFn: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts/unresolved'] });
    },
    onSuccess: () => {
      toast({
        title: "Alerts Refreshed",
        description: "Alert data has been refreshed.",
      });
    },
  });

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case "traffic":
        return "bg-green-100 text-green-800";
      case "energy":
        return "bg-blue-100 text-blue-800";
      case "environmental":
        return "bg-purple-100 text-purple-800";
      case "population":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const filteredAlerts = alerts?.filter((alert: any) => {
    const matchesType = filterType === "all" || alert.type === filterType;
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
    const matchesSearch = searchTerm === "" || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.module.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSeverity && matchesSearch;
  }) || [];

  if (authLoading || alertsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading alert system...</p>
        </div>
      </div>
    );
  }

  const criticalAlerts = unresolvedAlerts?.filter((alert: any) => alert.severity === "critical").length || 0;
  const highAlerts = unresolvedAlerts?.filter((alert: any) => alert.severity === "high").length || 0;
  const totalUnresolved = unresolvedAlerts?.length || 0;
  const resolvedToday = alerts?.filter((alert: any) => {
    if (!alert.resolvedAt) return false;
    const today = new Date();
    const resolvedDate = new Date(alert.resolvedAt);
    return resolvedDate.toDateString() === today.toDateString();
  }).length || 0;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Alert Management System"
          description="Real-time monitoring and incident management for city operations"
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Critical Alerts</p>
                    <p className="text-2xl font-bold text-slate-800">{criticalAlerts}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">High Priority</p>
                    <p className="text-2xl font-bold text-slate-800">{highAlerts}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Unresolved</p>
                    <p className="text-2xl font-bold text-slate-800">{totalUnresolved}</p>
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
                    <p className="text-sm font-medium text-slate-500">Resolved Today</p>
                    <p className="text-2xl font-bold text-slate-800">{resolvedToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="active" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="active">Active Alerts</TabsTrigger>
                <TabsTrigger value="all">All Alerts</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>
              <Button 
                onClick={() => refreshAlertsMutation.mutate()}
                disabled={refreshAlertsMutation.isPending}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {refreshAlertsMutation.isPending ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search alerts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <TabsContent value="active" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Alerts ({unresolvedAlerts?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {unresolvedLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-slate-500">Loading active alerts...</p>
                    </div>
                  ) : unresolvedAlerts && unresolvedAlerts.length > 0 ? (
                    <div className="space-y-4">
                      {unresolvedAlerts.map((alert: any) => (
                        <div key={alert.id} className="flex items-start space-x-4 p-4 border rounded-lg bg-white">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getAlertColor(alert.type)}`}>
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-slate-800">{alert.title}</h4>
                                <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge className={getSeverityColor(alert.severity)}>
                                    {alert.severity}
                                  </Badge>
                                  <Badge className={getModuleColor(alert.module)}>
                                    {alert.module}
                                  </Badge>
                                  <span className="text-xs text-slate-500">{timeAgo(alert.createdAt)}</span>
                                </div>
                              </div>
                              <Button
                                onClick={() => resolveAlertMutation.mutate(alert.id)}
                                disabled={resolveAlertMutation.isPending}
                                size="sm"
                                variant="outline"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Resolve
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No active alerts</p>
                      <p className="text-sm">All systems are operating normally</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Alerts ({filteredAlerts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alert</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAlerts.map((alert: any) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-800">{alert.title}</p>
                              <p className="text-sm text-slate-500 truncate max-w-xs">{alert.message}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{alert.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getModuleColor(alert.module)}>
                              {alert.module}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {alert.resolved ? (
                              <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell>{timeAgo(alert.createdAt)}</TableCell>
                          <TableCell>
                            {!alert.resolved && (
                              <Button
                                onClick={() => resolveAlertMutation.mutate(alert.id)}
                                disabled={resolveAlertMutation.isPending}
                                size="sm"
                                variant="outline"
                              >
                                Resolve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredAlerts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                            No alerts found matching your filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

<TabsContent value="resolved" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resolved Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alert</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Resolved</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts?.filter((alert: any) => alert.resolved).map((alert: any) => {
                        const duration = alert.resolvedAt && alert.createdAt
                          ? Math.floor((new Date(alert.resolvedAt).getTime() - new Date(alert.createdAt).getTime()) / (1000 * 60))
                          : 0;
                        
                        return (
                          <TableRow key={alert.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-slate-800">{alert.title}</p>
                                <p className="text-sm text-slate-500 truncate max-w-xs">{alert.message}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{alert.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getModuleColor(alert.module)}>
                                {alert.module}
                              </Badge>
                            </TableCell>
                            <TableCell>{timeAgo(alert.resolvedAt)}</TableCell>
                            <TableCell>{duration > 0 ? `${duration} min` : 'N/A'}</TableCell>
                          </TableRow>
                        );
                      })}
                      {!alerts?.some((alert: any) => alert.resolved) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            No resolved alerts found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
