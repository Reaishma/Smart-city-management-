import {
  users,
  trafficData,
  energyData,
  environmentalData,
  populationData,
  systemAlerts,
  systemActivity,
  predictions,
  type User,
  type UpsertUser,
  type TrafficData,
  type InsertTrafficData,
  type EnergyData,
  type InsertEnergyData,
  type EnvironmentalData,
  type InsertEnvironmentalData,
  type PopulationData,
  type InsertPopulationData,
  type SystemAlert,
  type InsertSystemAlert,
  type SystemActivity,
  type InsertSystemActivity,
  type Prediction,
  type InsertPrediction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Traffic data operations
  createTrafficData(data: InsertTrafficData): Promise<TrafficData>;
  getTrafficData(limit?: number): Promise<TrafficData[]>;
  getTrafficDataByTimeRange(startTime: Date, endTime: Date): Promise<TrafficData[]>;

  // Energy data operations
  createEnergyData(data: InsertEnergyData): Promise<EnergyData>;
  getEnergyData(limit?: number): Promise<EnergyData[]>;
  getEnergyDataByTimeRange(startTime: Date, endTime: Date): Promise<EnergyData[]>;

  // Environmental data operations
  createEnvironmentalData(data: InsertEnvironmentalData): Promise<EnvironmentalData>;
  getEnvironmentalData(limit?: number): Promise<EnvironmentalData[]>;
  getEnvironmentalDataByTimeRange(startTime: Date, endTime: Date): Promise<EnvironmentalData[]>;

  // Population data operations
  createPopulationData(data: InsertPopulationData): Promise<PopulationData>;
  getPopulationData(limit?: number): Promise<PopulationData[]>;
  getPopulationDataByTimeRange(startTime: Date, endTime: Date): Promise<PopulationData[]>;

  // System alerts operations
  createSystemAlert(alert: InsertSystemAlert): Promise<SystemAlert>;
  getSystemAlerts(limit?: number): Promise<SystemAlert[]>;
  getUnresolvedAlerts(): Promise<SystemAlert[]>;
  resolveAlert(id: number): Promise<void>;

  // System activity operations
  createSystemActivity(activity: InsertSystemActivity): Promise<SystemActivity>;
  getSystemActivity(limit?: number): Promise<SystemActivity[]>;

  // Predictions operations
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  getPredictions(module?: string, limit?: number): Promise<Prediction[]>;
  getLatestPredictions(): Promise<Prediction[]>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalPopulation: number;
    energyConsumption: number;
    trafficFlow: number;
    airQuality: string;
    alertCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Traffic data operations
  async createTrafficData(data: InsertTrafficData): Promise<TrafficData> {
    const [trafficRecord] = await db
      .insert(trafficData)
      .values(data)
      .returning();
    return trafficRecord;
  }

  async getTrafficData(limit = 100): Promise<TrafficData[]> {
    return await db
      .select()
      .from(trafficData)
      .orderBy(desc(trafficData.timestamp))
      .limit(limit);
  }

  async getTrafficDataByTimeRange(startTime: Date, endTime: Date): Promise<TrafficData[]> {
    return await db
      .select()
      .from(trafficData)
      .where(and(
        gte(trafficData.timestamp, startTime),
        lte(trafficData.timestamp, endTime)
      ))
      .orderBy(desc(trafficData.timestamp));
  }

  // Energy data operations
  async createEnergyData(data: InsertEnergyData): Promise<EnergyData> {
    const [energyRecord] = await db
      .insert(energyData)
      .values(data)
      .returning();
    return energyRecord;
  }

  async getEnergyData(limit = 100): Promise<EnergyData[]> {
    return await db
      .select()
      .from(energyData)
      .orderBy(desc(energyData.timestamp))
      .limit(limit);
  }

  async getEnergyDataByTimeRange(startTime: Date, endTime: Date): Promise<EnergyData[]> {
    return await db
      .select()
      .from(energyData)
      .where(and(
        gte(energyData.timestamp, startTime),
        lte(energyData.timestamp, endTime)
      ))
      .orderBy(desc(energyData.timestamp));
  }

  // Environmental data operations
  async createEnvironmentalData(data: InsertEnvironmentalData): Promise<EnvironmentalData> {
    const [environmentalRecord] = await db
      .insert(environmentalData)
      .values(data)
      .returning();
    return environmentalRecord;
  }

  async getEnvironmentalData(limit = 100): Promise<EnvironmentalData[]> {
    return await db
      .select()
      .from(environmentalData)
      .orderBy(desc(environmentalData.timestamp))
      .limit(limit);
  }

  async getEnvironmentalDataByTimeRange(startTime: Date, endTime: Date): Promise<EnvironmentalData[]> {
    return await db
      .select()
      .from(environmentalData)
      .where(and(
        gte(environmentalData.timestamp, startTime),
        lte(environmentalData.timestamp, endTime)
      ))
      .orderBy(desc(environmentalData.timestamp));
  }

  // Population data operations
  async createPopulationData(data: InsertPopulationData): Promise<PopulationData> {
    const [populationRecord] = await db
      .insert(populationData)
      .values(data)
      .returning();
    return populationRecord;
  }

  async getPopulationData(limit = 100): Promise<PopulationData[]> {
    return await db
      .select()
      .from(populationData)
      .orderBy(desc(populationData.timestamp))
      .limit(limit);
  }

  async getPopulationDataByTimeRange(startTime: Date, endTime: Date): Promise<PopulationData[]> {
    return await db
      .select()
      .from(populationData)
      .where(and(
        gte(populationData.timestamp, startTime),
        lte(populationData.timestamp, endTime)
      ))
      .orderBy(desc(populationData.timestamp));
  }

  // System alerts operations
  async createSystemAlert(alert: InsertSystemAlert): Promise<SystemAlert> {
    const [alertRecord] = await db
      .insert(systemAlerts)
      .values(alert)
      .returning();
    return alertRecord;
  }

  async getSystemAlerts(limit = 50): Promise<SystemAlert[]> {
    return await db
      .select()
      .from(systemAlerts)
      .orderBy(desc(systemAlerts.createdAt))
      .limit(limit);
  }

  async getUnresolvedAlerts(): Promise<SystemAlert[]> {
    return await db
      .select()
      .from(systemAlerts)
      .where(eq(systemAlerts.resolved, false))
      .orderBy(desc(systemAlerts.createdAt));
  }

  async resolveAlert(id: number): Promise<void> {
    await db
      .update(systemAlerts)
      .set({ resolved: true, resolvedAt: new Date() })
      .where(eq(systemAlerts.id, id));
  }

  // System activity operations
  async createSystemActivity(activity: InsertSystemActivity): Promise<SystemActivity> {
    const [activityRecord] = await db
      .insert(systemActivity)
      .values(activity)
      .returning();
    return activityRecord;
  }

  async getSystemActivity(limit = 50): Promise<SystemActivity[]> {
    return await db
      .select()
      .from(systemActivity)
      .orderBy(desc(systemActivity.createdAt))
      .limit(limit);
  }

  // Predictions operations
  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const [predictionRecord] = await db
      .insert(predictions)
      .values(prediction)
      .returning();
    return predictionRecord;
  }

  async getPredictions(module?: string, limit = 50): Promise<Prediction[]> {
    if (module) {
      return await db
        .select()
        .from(predictions)
        .where(eq(predictions.module, module))
        .orderBy(desc(predictions.createdAt))
        .limit(limit);
    }

    return await db
      .select()
      .from(predictions)
      .orderBy(desc(predictions.createdAt))
      .limit(limit);
  }

  async getLatestPredictions(): Promise<Prediction[]> {
    return await db
      .select()
      .from(predictions)
      .orderBy(desc(predictions.createdAt))
      .limit(10);
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    totalPopulation: number;
    energyConsumption: number;
    trafficFlow: number;
    airQuality: string;
    alertCount: number;
  }> {
    // Get latest population data
    const [latestPopulation] = await db
      .select()
      .from(populationData)
      .orderBy(desc(populationData.timestamp))
      .limit(1);

    // Get latest energy data
    const [latestEnergy] = await db
      .select()
      .from(energyData)
      .orderBy(desc(energyData.timestamp))
      .limit(1);

    // Get average traffic flow
    const [avgTraffic] = await db
      .select({
        avgFlow: sql<number>`AVG(${trafficData.flowRate})`,
      })
      .from(trafficData)
      .where(gte(trafficData.timestamp, new Date(Date.now() - 24 * 60 * 60 * 1000)));

    // Get latest environmental data
    const [latestEnvironmental] = await db
      .select()
      .from(environmentalData)
      .orderBy(desc(environmentalData.timestamp))
      .limit(1);

    // Get unresolved alerts count
    const [alertCount] = await db
      .select({ count: count() })
      .from(systemAlerts)
      .where(eq(systemAlerts.resolved, false));

    // Determine air quality string
    let airQuality = "Good";
    if (latestEnvironmental?.airQualityIndex) {
      if (latestEnvironmental.airQualityIndex <= 50) airQuality = "Good";
      else if (latestEnvironmental.airQualityIndex <= 100) airQuality = "Moderate";
      else if (latestEnvironmental.airQualityIndex <= 150) airQuality = "Poor";
      else airQuality = "Unhealthy";
    }

    return {
      totalPopulation: latestPopulation?.totalPopulation || 0,
      energyConsumption: latestEnergy?.totalConsumption || 0,
      trafficFlow: avgTraffic?.avgFlow || 0,
      airQuality,
      alertCount: alertCount?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
      
