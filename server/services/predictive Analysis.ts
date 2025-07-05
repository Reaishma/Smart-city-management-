import { storage } from "../storage";
import { type InsertPrediction } from "@shared/schema";

interface DataPoint {
  timestamp: Date;
  value: number;
}

function calculateLinearRegression(data: DataPoint[]): { slope: number; intercept: number; r2: number } {
  if (data.length < 2) return { slope: 0, intercept: 0, r2: 0 };

  const n = data.length;
  const timestamps = data.map(d => d.timestamp.getTime());
  const values = data.map(d => d.value);

  const sumX = timestamps.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = timestamps.reduce((acc, x, i) => acc + x * values[i], 0);
  const sumXX = timestamps.reduce((acc, x) => acc + x * x, 0);
  const sumYY = values.reduce((acc, y) => acc + y * y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const meanY = sumY / n;
  const ssRes = values.reduce((acc, y, i) => {
    const predicted = slope * timestamps[i] + intercept;
    return acc + Math.pow(y - predicted, 2);
  }, 0);
  const ssTot = values.reduce((acc, y) => acc + Math.pow(y - meanY, 2), 0);
  const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

  return { slope, intercept, r2: Math.max(0, r2) };
}

function calculateMovingAverage(data: DataPoint[], window: number): number {
  if (data.length === 0) return 0;
  
  const recentData = data.slice(-window);
  const sum = recentData.reduce((acc, d) => acc + d.value, 0);
  return sum / recentData.length;
}

function detectAnomalies(data: DataPoint[]): { isAnomaly: boolean; threshold: number } {
  if (data.length < 10) return { isAnomaly: false, threshold: 0 };

  const values = data.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  const threshold = mean + 2 * stdDev; // 2 standard deviations
  const latestValue = values[values.length - 1];
  
  return {
    isAnomaly: latestValue > threshold,
    threshold
  };
}

function predictNextValue(data: DataPoint[], hoursAhead: number): { value: number; confidence: number } {
  if (data.length < 5) return { value: 0, confidence: 0 };

  const regression = calculateLinearRegression(data);
  const movingAvg = calculateMovingAverage(data, 5);
  
  // Combine linear regression with moving average
  const futureTimestamp = Date.now() + (hoursAhead * 60 * 60 * 1000);
  const regressionPrediction = regression.slope * futureTimestamp + regression.intercept;
  
  // Weight predictions based on R-squared
  const regressionWeight = Math.max(0.3, regression.r2);
  const movingAvgWeight = 1 - regressionWeight;
  
  const prediction = regressionPrediction * regressionWeight + movingAvg * movingAvgWeight;
  const confidence = Math.min(0.95, Math.max(0.1, regression.r2 * 0.9));
  
  return { value: prediction, confidence };
}

async function generateTrafficPredictions() {
  try {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    
    const trafficData = await storage.getTrafficDataByTimeRange(startTime, endTime);
    
    if (trafficData.length === 0) return;

    // Group by location
    const locationGroups = trafficData.reduce((groups, data) => {
      if (!groups[data.location]) groups[data.location] = [];
      groups[data.location].push({
        timestamp: data.timestamp!,
        value: data.flowRate
      });
      return groups;
    }, {} as Record<string, DataPoint[]>);

    const predictions: InsertPrediction[] = [];

    for (const [location, data] of Object.entries(locationGroups)) {
      // Sort by timestamp
      data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      // Predict for next 1, 6, 12, and 24 hours
      for (const hours of [1, 6, 12, 24]) {
        const prediction = predictNextValue(data, hours);
        
        predictions.push({
          module: "traffic",
          predictionType: "flow",
          predictedValue: prediction.value,
          confidence: prediction.confidence,
          timeHorizon: hours,
          metadata: { location },
        });
      }
    }

    // Save predictions
    for (const prediction of predictions) {
      await storage.createPrediction(prediction);
    }

    console.log(`Generated ${predictions.length} traffic predictions`);
  } catch (error) {
    console.error("Error generating traffic predictions:", error);
  }
}

async function generateEnergyPredictions() {
  try {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    
    const energyData = await storage.getEnergyDataByTimeRange(startTime, endTime);
    
    if (energyData.length === 0) return;

    const consumptionData = energyData.map(d => ({
      timestamp: d.timestamp!,
      value: d.totalConsumption
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const renewableData = energyData.map(d => ({
      timestamp: d.timestamp!,
      value: d.renewablePercentage
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const predictions: InsertPrediction[] = [];

    // Energy demand predictions
    for (const hours of [1, 6, 12, 24]) {
      const demandPrediction = predictNextValue(consumptionData, hours);
      
      predictions.push({
        module: "energy",
        predictionType: "demand",
        predictedValue: demandPrediction.value,
        confidence: demandPrediction.confidence,
        timeHorizon: hours,
        metadata: { type: "total_consumption" },
      });
    }

    // Renewable energy predictions
    for (const hours of [6, 12, 24]) {
      const renewablePrediction = predictNextValue(renewableData, hours);
      
      predictions.push({
        module: "energy",
        predictionType: "renewable",
        predictedValue: renewablePrediction.value,
        confidence: renewablePrediction.confidence,
        timeHorizon: hours,
        metadata: { type: "renewable_percentage" },
      });
    }

    // Save predictions
    for (const prediction of predictions) {
      await storage.createPrediction(prediction);
    }

    console.log(`Generated ${predictions.length} energy predictions`);
  } catch (error) {
    console.error("Error generating energy predictions:", error);
  }
}

async function generateEnvironmentalPredictions() {
  try {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    
    const environmentalData = await storage.getEnvironmentalDataByTimeRange(startTime, endTime);
    
    if (environmentalData.length === 0) return;

    const aqiData = environmentalData.map(d => ({
      timestamp: d.timestamp!,
      value: d.airQualityIndex
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const predictions: InsertPrediction[] = [];

    // Air quality predictions
    for (const hours of [1, 6, 12, 24]) {
      const aqiPrediction = predictNextValue(aqiData, hours);
      
      predictions.push({
        module: "environmental",
        predictionType: "quality",
        predictedValue: aqiPrediction.value,
        confidence: aqiPrediction.confidence,
        timeHorizon: hours,
        metadata: { type: "air_quality_index" },
      });
    }

    // Save predictions
    for (const prediction of predictions) {
      await storage.createPrediction(prediction);
    }

    console.log(`Generated ${predictions.length} environmental predictions`);
  } catch (error) {
    console.error("Error generating environmental predictions:", error);
  }
}

export async function generatePredictions() {
  console.log("Generating predictions...");
  
  await Promise.all([
    generateTrafficPredictions(),
    generateEnergyPredictions(),
    generateEnvironmentalPredictions(),
  ]);
  
  console.log("Prediction generation completed");
}

// Generate predictions every hour
setInterval(generatePredictions, 60 * 60 * 1000);

// Generate initial predictions after 1 minute
setTimeout(generatePredictions, 60 * 1000);
