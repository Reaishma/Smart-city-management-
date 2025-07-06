import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function EnvironmentalChart() {
  const { data: environmentalData, isLoading } = useQuery({
    queryKey: ['/api/environmental'],
    retry: false,
  });

  const processChartData = (data: any[]) => {
    if (!data || data.length === 0) return [];

    // Get last 24 hours of data, group by hour
    const hourlyData = data.reduce((acc: any, item: any) => {
      const hour = new Date(item.timestamp).getHours();
      const timeLabel = `${hour}:00`;
      
      if (!acc[timeLabel]) {
        acc[timeLabel] = { time: timeLabel, values: [] };
      }
      acc[timeLabel].values.push(item.airQualityIndex);
      return acc;
    }, {});

    // Calculate average AQI per hour
    return Object.values(hourlyData).map((item: any) => ({
      time: item.time,
      aqi: Math.round(item.values.reduce((a: number, b: number) => a + b, 0) / item.values.length)
    }));
  };

  const chartData = processChartData(environmentalData || []);

  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Air Quality Index</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Air Quality Index</h3>
        <div className="flex items-center space-x-2">
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1">
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              formatter={(value) => [`${value}`, 'AQI']}
              labelStyle={{ color: '#1e293b' }}
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
    </div>
  );
}
