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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, TrendingUp, UserCheck, Globe, Download } from "lucide-react";

export default function Population() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: populationData, isLoading: populationLoading } = useQuery({
    queryKey: ['/api/population'],
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
      const response = await fetch(`/api/export/population?startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Export failed');
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `population_data_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Export Successful",
        description: "Population data has been exported successfully.",
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
        description: "Failed to export population data.",
        variant: "destructive",
      });
    },
  });

  const processPopulationTrends = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    return data.slice().reverse().map((item: any, index: number) => ({
      date: new Date(item.timestamp).toLocaleDateString(),
      population: item.totalPopulation,
      activeUsers: item.activeUsers || 0,
      growthRate: item.growthRate || 0
    })).slice(-10);
  };

  const processAgeGroups = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    const latest = data[0];
    if (!latest || !latest.demographics?.ageGroups) return [];

    return Object.entries(latest.demographics.ageGroups).map(([age, percentage]) => ({
      name: age,
      value: percentage as number,
      color: getAgeGroupColor(age)
    }));
  };

  const processIncomeDistribution = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    const latest = data[0];
    if (!latest || !latest.demographics?.income) return [];

    return Object.entries(latest.demographics.income).map(([income, percentage]) => ({
      name: income.charAt(0).toUpperCase() + income.slice(1),
      value: percentage as number,
      color: getIncomeColor(income)
    }));
  };

  const getAgeGroupColor = (age: string) => {
    const colors: { [key: string]: string } = {
      '0-18': '#3b82f6',
      '19-35': '#10b981',
      '36-55': '#f59e0b',
      '56+': '#ef4444'
    };
    return colors[age] || '#64748b';
  };

  const getIncomeColor = (income: string) => {
    const colors: { [key: string]: string } = {
      'low': '#ef4444',
      'medium': '#f59e0b',
      'high': '#10b981'
    };
    return colors[income] || '#64748b';
  };

  if (authLoading || populationLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading population analytics...</p>
        </div>
      </div>
    );
  }

  const trendData = processPopulationTrends(populationData || []);
  const ageGroupData = processAgeGroups(populationData || []);
  const incomeData = processIncomeDistribution(populationData || []);
  const recentData = populationData?.slice(0, 5) || [];
  const latest = recentData[0];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Population Analytics"
          description="Demographic insights and urban planning data analysis"
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Population</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {latest ? (latest.totalPopulation / 1000000).toFixed(2) + 'M' : '0M'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Active Users</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {latest ? (latest.activeUsers / 1000).toFixed(0) + 'K' : '0K'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Growth Rate</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {latest ? latest.growthRate?.toFixed(1) + '%' : '0%'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Density</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {latest ? Math.round(latest.totalPopulation / 1000) + '/km²' : '0/km²'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
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
                {/* Population Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Population Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                          <Tooltip 
                            formatter={(value) => [`${(value as number / 1000000).toFixed(2)}M`, 'Population']}
                            contentStyle={{ 
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="population" 
                            stroke="hsl(217, 91%, 60%)" 
                            strokeWidth={2}
                            dot={{ fill: "hsl(217, 91%, 60%)", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Users */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Users Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                          <Tooltip 
                            formatter={(value) => [`${(value as number / 1000).toFixed(1)}K`, 'Active Users']}
                            contentStyle={{ 
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="activeUsers" 
                            stroke="hsl(142, 71%, 45%)" 
                            strokeWidth={2}
                            dot={{ fill: "hsl(142, 71%, 45%)", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Data */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Population Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentData.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Users className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-800">
                              {(item.totalPopulation / 1000000).toFixed(2)}M people
                            </p>
                            <p className="text-sm text-slate-500">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">
                            {(item.activeUsers / 1000).toFixed(0)}K active
                          </Badge>
                          <span className="text-sm font-medium">
                            {item.growthRate > 0 ? '+' : ''}{item.growthRate?.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                    {recentData.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <p>No population data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="demographics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Age Groups */}
                <Card>
                  <CardHeader>
                    <CardTitle>Age Groups Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ageGroupData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {ageGroupData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Percentage']}
                            contentStyle={{ 
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Income Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Income Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {incomeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Percentage']}
                            contentStyle={{ 
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Rate Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${value}%`} />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'Growth Rate']}
                          contentStyle={{ 
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="growthRate" 
                          stroke="hsl(32, 95%, 44%)" 
                          strokeWidth={2}
                          dot={{ fill: "hsl(32, 95%, 44%)", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
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
