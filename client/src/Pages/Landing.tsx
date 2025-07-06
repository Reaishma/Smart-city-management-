import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Zap, Leaf, BarChart3, Shield } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <Building className="w-8 h-8 text-blue-600" />,
      title: "Traffic Management",
      description: "Real-time traffic flow monitoring and optimization"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Energy Grid",
      description: "Smart energy distribution and renewable integration"
    },
    {
      icon: <Leaf className="w-8 h-8 text-green-600" />,
      title: "Environmental Monitoring",
      description: "Air quality, noise levels, and climate tracking"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Population Analytics",
      description: "Demographic insights and urban planning data"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
      title: "Predictive Analytics",
      description: "AI-powered forecasting for city planning"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Alert System",
      description: "Proactive monitoring and incident management"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">SmartCity</h1>
                <p className="text-sm text-slate-500">Management Hub</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-primary/90"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-6">
            Next-Generation City Management
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
            Smart City
            <span className="text-primary block">Management System</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Comprehensive smart city management platform with real-time monitoring, 
            predictive analytics, and intelligent automation for modern urban infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              Comprehensive City Management
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Monitor, analyze, and optimize every aspect of your smart city infrastructure 
              with our integrated management platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-slate-600">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2.4M+</div>
              <div className="text-slate-600">Citizens Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">15%</div>
              <div className="text-slate-600">Energy Savings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-slate-600">Real-time Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SmartCity</h1>
                <p className="text-sm text-slate-400">Management Hub</p>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              © 2024 SmartCity Management System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
