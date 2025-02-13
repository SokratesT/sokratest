import { type InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organization } from "./auth";

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Course = InferSelectModel<typeof courses>;

export const coursesRelations = relations(courses, ({ one, many }) => ({
  organizationId: one(organization, {
    fields: [courses.organizationId],
    references: [organization.id],
  }),
}));
