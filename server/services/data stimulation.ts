import { storage } from "../storage";
import { 
  type InsertTrafficData,
  type InsertEnergyData,
  type InsertEnvironmentalData,
  type InsertPopulationData,
  type InsertSystemAlert,
} from "@shared/schema";

// Traffic locations
const TRAFFIC_LOCATIONS = [
  "Downtown Main St",
  "Highway 101 North",
  "Bridge Avenue",
  "Central Plaza",
  "Industrial District",
  "Residential Area East",
  "University Campus",
  "Shopping District",
];

// Congestion levels
const CONGESTION_LEVELS = ["low", "medium", "high"];

// Alert types and severities
const ALERT_TYPES = ["error", "warning", "info", "success"];
const ALERT_SEVERITIES = ["low", "medium", "high", "critical"];
const MODULES = ["traffic", "energy", "environmental", "population"];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateTrafficData(): InsertTrafficData {
  const baseFlow = 50 + Math.random() * 40; // 50-90%
  const hour = new Date().getHours();
  
  // Simulate rush hour patterns
  let flowModifier = 1;
  if (hour >= 7 && hour <= 9) flowModifier = 1.3; // Morning rush
  else if (hour >= 17 && hour <= 19) flowModifier = 1.4; // Evening rush
  else if (hour >= 22 || hour <= 5) flowModifier = 0.6; // Night time
  
  const flowRate = Math.min(100, baseFlow * flowModifier);
  
  let congestionLevel: string;
  if (flowRate > 80) congestionLevel = "high";
  else if (flowRate > 60) congestionLevel = "medium";
  else congestionLevel = "low";

  return {
    location: getRandomElement(TRAFFIC_LOCATIONS),
    flowRate,
    congestionLevel,
    averageSpeed: getRandomInRange(20, 60),
    vehicleCount: Math.floor(getRandomInRange(100, 500)),
    timestamp: new Date(),
  };
}

function generateEnergyData(): InsertEnergyData {
  const baseConsumption = 800 + Math.random() * 200; // 800-1000 MW
  const hour = new Date().getHours();
  
  // Simulate daily energy patterns
  let consumptionModifier = 1;
  if (hour >= 18 && hour <= 22) consumptionModifier = 1.2; // Evening peak
  else if (hour >= 10 && hour <= 16) consumptionModifier = 1.1; // Daytime
  else if (hour >= 0 && hour <= 6) consumptionModifier = 0.7; // Night time
  
  const totalConsumption = baseConsumption * consumptionModifier;
  const renewablePercentage = 30 + Math.random() * 30; // 30-60%
  
  // Solar output depends on time of day
  const solarOutput = hour >= 6 && hour <= 18 
    ? getRandomInRange(50, 200) * Math.sin((hour - 6) * Math.PI / 12)
    : 0;
  
  return {
    totalConsumption,
    renewablePercentage,
    solarOutput,
    windOutput: getRandomInRange(20, 80),
    gridLoad: totalConsumption * 0.85,
    peakDemand: totalConsumption * 1.2,
    timestamp: new Date(),
  };
}

function generateEnvironmentalData(): InsertEnvironmentalData {
  const baseAQI = 30 + Math.random() * 40; // 30-70 (good to moderate)
  const hour = new Date().getHours();
  
  // Simulate daily air quality patterns
  let aqiModifier = 1;
  if (hour >= 7 && hour <= 9) aqiModifier = 1.3; // Morning traffic
  else if (hour >= 17 && hour <= 19) aqiModifier = 1.2; // Evening traffic
  else if (hour >= 2 && hour <= 6) aqiModifier = 0.8; // Early morning
  
  const airQualityIndex = Math.floor(baseAQI * aqiModifier);
  
  return {
    airQualityIndex,
    pm25: getRandomInRange(5, 25),
    pm10: getRandomInRange(10, 50),
    temperature: getRandomInRange(15, 30),
    humidity: getRandomInRange(40, 80),
    noiseLevel: getRandomInRange(45, 75),
    timestamp: new Date(),
  };
}

function generatePopulationData(): InsertPopulationData {
  const basePopulation = 2400000; // 2.4M
  const dailyVariation = Math.floor(getRandomInRange(-1000, 1000));
  
  return {
    totalPopulation: basePopulation + dailyVariation,
    activeUsers: Math.floor(getRandomInRange(50000, 150000)),
    demographics: {
      ageGroups: {
        "0-18": 22,
        "19-35": 35,
        "36-55": 28,
        "56+": 15,
      },
      income: {
        low: 30,
        medium: 50,
        high: 20,
      },
    },
    growthRate: getRandomInRange(-0.5, 2.5),
    timestamp: new Date(),
  };
}

function shouldGenerateAlert(): boolean {
  return Math.random() < 0.1; // 10% chance
}

function generateSystemAlert(): InsertSystemAlert {
  const alertTemplates = [
    {
      type: "error",
      title: "Power Grid Alert",
      message: "High demand detected in Sector 7",
      module: "energy",
      severity: "high",
    },
    {
      type: "warning",
      title: "Traffic Congestion",
      message: "Heavy traffic detected at Main St intersection",
      module: "traffic",
      severity: "medium",
    },
    {
      type: "info",
      title: "System Maintenance",
      message: "Scheduled maintenance completed successfully",
      module: "system",
      severity: "low",
    },
    {
      type: "warning",
      title: "Air Quality Alert",
      message: "PM2.5 levels above normal threshold",
      module: "environmental",
      severity: "medium",
    },
    {
      type: "success",
      title: "Backup Completed",
      message: "Daily system backup completed successfully",
      module: "system",
      severity: "low",
    },
  ];

  return getRandomElement(alertTemplates);
}

async function simulateDataGeneration() {
  try {
    // Generate traffic data
    const trafficData = generateTrafficData();
    await storage.createTrafficData(trafficData);

    // Generate energy data
    const energyData = generateEnergyData();
    await storage.createEnergyData(energyData);

    // Generate environmental data
    const environmentalData = generateEnvironmentalData();
    await storage.createEnvironmentalData(environmentalData);

    // Generate population data (less frequent)
    if (Math.random() < 0.1) { // 10% chance
      const populationData = generatePopulationData();
      await storage.createPopulationData(populationData);
    }

    // Generate system alerts (occasional)
    if (shouldGenerateAlert()) {
      const alert = generateSystemAlert();
      await storage.createSystemAlert(alert);
    }

    console.log("Data simulation cycle completed");
  } catch (error) {
    console.error("Error in data simulation:", error);
  }
}

export function startDataSimulation() {
  console.log("Starting data simulation...");
  
  // Run immediately
  simulateDataGeneration();
  
  // Then run every 30 seconds
  setInterval(simulateDataGeneration, 30000);
}
