import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  real,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// City Metrics Tables
export const trafficData = pgTable("traffic_data", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  location: varchar("location").notNull(),
  flowRate: real("flow_rate").notNull(), // percentage
  congestionLevel: varchar("congestion_level").notNull(), // low, medium, high
  averageSpeed: real("average_speed"), // km/h
  vehicleCount: integer("vehicle_count"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const energyData = pgTable("energy_data", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  totalConsumption: real("total_consumption").notNull(), // MW
  renewablePercentage: real("renewable_percentage").notNull(),
  solarOutput: real("solar_output"),
  windOutput: real("wind_output"),
  gridLoad: real("grid_load"),
  peakDemand: real("peak_demand"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const environmentalData = pgTable("environmental_data", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  airQualityIndex: integer("air_quality_index").notNull(),
  pm25: real("pm25"),
  pm10: real("pm10"),
  temperature: real("temperature"),
  humidity: real("humidity"),
  noiseLevel: real("noise_level"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const populationData = pgTable("population_data", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  totalPopulation: integer("total_population").notNull(),
  activeUsers: integer("active_users"),
  demographics: jsonb("demographics"),
  growthRate: real("growth_rate"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  type: varchar("type").notNull(), // error, warning, info, success
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  module: varchar("module").notNull(), // traffic, energy, environmental, population
  severity: varchar("severity").notNull(), // low, medium, high, critical
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const systemActivity = pgTable("system_activity", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  module: varchar("module").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  module: varchar("module").notNull(), // traffic, energy, environmental
  predictionType: varchar("prediction_type").notNull(), // demand, flow, quality
  predictedValue: real("predicted_value").notNull(),
  confidence: real("confidence").notNull(),
  timeHorizon: integer("time_horizon").notNull(), // hours
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  activities: many(systemActivity),
}));

export const systemActivityRelations = relations(systemActivity, ({ one }) => ({
  user: one(users, {
    fields: [systemActivity.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertTrafficDataSchema = createInsertSchema(trafficData).omit({
  id: true,
  createdAt: true,
});

export const insertEnergyDataSchema = createInsertSchema(energyData).omit({
  id: true,
  createdAt: true,
});

export const insertEnvironmentalDataSchema = createInsertSchema(environmentalData).omit({
  id: true,
  createdAt: true,
});

export const insertPopulationDataSchema = createInsertSchema(populationData).omit({
  id: true,
  createdAt: true,
});

export const insertSystemAlertSchema = createInsertSchema(systemAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertSystemActivitySchema = createInsertSchema(systemActivity).omit({
  id: true,
  createdAt: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type TrafficData = typeof trafficData.$inferSelect;
export type InsertTrafficData = z.infer<typeof insertTrafficDataSchema>;
export type EnergyData = typeof energyData.$inferSelect;
export type InsertEnergyData = z.infer<typeof insertEnergyDataSchema>;
export type EnvironmentalData = typeof environmentalData.$inferSelect;
export type InsertEnvironmentalData = z.infer<typeof insertEnvironmentalDataSchema>;
export type PopulationData = typeof populationData.$inferSelect;
export type InsertPopulationData = z.infer<typeof insertPopulationDataSchema>;
export type SystemAlert = typeof systemAlerts.$inferSelect;
export type InsertSystemAlert = z.infer<typeof insertSystemAlertSchema>;
export type SystemActivity = typeof systemActivity.$inferSelect;
export type InsertSystemActivity = z.infer<typeof insertSystemActivitySchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
                         
