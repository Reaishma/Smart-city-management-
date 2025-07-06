import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface PredictionCardProps {
  prediction: {
    id: number;
    module: string;
    predictionType: string;
    predictedValue: number;
    confidence: number;
    timeHorizon: number;
    metadata?: any;
  };
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const getModuleConfig = (module: string) => {
    switch (module) {
      case "energy":
        return {
          title: "Energy Demand Forecast",
          icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
          color: "energy",
          unit: "MW"
        };
      case "traffic":
        return {
          title: "Traffic Flow Prediction",
          icon: <TrendingDown className="w-4 h-4 text-green-600" />,
          color: "traffic",
          unit: "%"
        };
      case "environmental":
        return {
          title: "Air Quality Forecast",
          icon: <Activity className="w-4 h-4 text-purple-600" />,
          color: "environmental",
          unit: "AQI"
        };
      default:
        return {
          title: "Prediction",
          icon: <Activity className="w-4 h-4 text-blue-600" />,
          color: "energy",
          unit: ""
        };
    }
  };

  const config = getModuleConfig(prediction.module);
  const confidencePercentage = Math.round(prediction.confidence * 100);

  return (
    <div className={cn("prediction-card", config.color)}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-slate-800">{config.title}</h4>
        <span className="text-xs text-slate-600 bg-white/50 px-2 py-1 rounded-full">
          Next {prediction.timeHorizon}h
        </span>
      </div>
      <div className="flex items-center space-x-2">
        {config.icon}
        <span className="text-sm text-slate-600">
          {prediction.predictionType === "demand" && "Peak demand expected"}
          {prediction.predictionType === "flow" && "Flow optimization"}
          {prediction.predictionType === "quality" && "Quality conditions"}
          {prediction.predictionType === "renewable" && "Renewable energy"}
        </span>
      </div>
      <div className="mt-2 flex items-center space-x-2">
        <div className="flex-1 bg-white/30 rounded-full h-2">
          <div 
            className="bg-current h-2 rounded-full opacity-70" 
            style={{ width: `${confidencePercentage}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium">
          {Math.round(prediction.predictedValue)}{config.unit}
        </span>
      </div>
    </div>
  );
}
