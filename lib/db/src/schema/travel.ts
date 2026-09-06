import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").notNull().default("customer"),
  passwordHash: text("password_hash").notNull(),
  isBlacklisted: integer("is_blacklisted").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const toursTable = pgTable("tours", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  destinations: jsonb("destinations").notNull(),
  days: integer("days").notNull(),
  nights: integer("nights").notNull(),
  price: integer("price").notNull(),
  style: text("style").notNull(),
  image: text("image").notNull(),
  rating: integer("rating").notNull().default(5),
  reviews: integer("reviews").notNull().default(0),
  itinerary: jsonb("itinerary").notNull(),
  inclusions: jsonb("inclusions").notNull(),
  exclusions: jsonb("exclusions").notNull(),
  accommodation: text("accommodation").notNull(),
  transportation: text("transportation").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  supportEmail: text("support_email").notNull(),
  supportPhone: text("support_phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  orderNumber: text("order_number").notNull().unique(),
  tourId: integer("tour_id").notNull(),
  tourTitle: text("tour_title").notNull(),
  travelDate: text("travel_date").notNull(),
  travelers: integer("travelers").notNull(),
  amount: integer("amount").notNull(),
  paymentStatus: text("payment_status").notNull(),
  bookingStatus: text("booking_status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customPlansTable = pgTable("custom_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  destinations: jsonb("destinations").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  duration: integer("duration").notNull(),
  travelers: integer("travelers").notNull(),
  style: text("style").notNull(),
  interests: jsonb("interests").notNull(),
  accommodation: text("accommodation").notNull(),
  transportation: text("transportation").notNull(),
  estimatedBudget: integer("estimated_budget").notNull(),
  itinerary: jsonb("itinerary").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});