import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import TrafficManagement from "@/pages/TrafficManagement";
import EnergyGrid from "@/pages/EnergyGrid";
import Environmental from "@/pages/Environmental";
import Population from "@/pages/Population";
import PredictiveAnalytics from "@/pages/PredictiveAnalytics";
import AdminPanel from "@/pages/AdminPanel";
import AlertSystem from "@/pages/AlertSystem";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/traffic" component={TrafficManagement} />
          <Route path="/energy" component={EnergyGrid} />
          <Route path="/environmental" component={Environmental} />
          <Route path="/population" component={Population} />
          <Route path="/analytics" component={PredictiveAnalytics} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/alerts" component={AlertSystem} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
