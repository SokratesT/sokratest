import { type InferSelectModel, relations } from "drizzle-orm";
import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { organization } from "./auth";

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id),
  description: text("description").notNull(),
  createdAt: date("created_at").default("now()"),
  updatedAt: date("updated_at").default("now()"),
});

export type Course = InferSelectModel<typeof courses>;

export const coursesRelations = relations(courses, ({ one, many }) => ({
  organizationId: one(organization, {
    fields: [courses.organizationId],
    references: [organization.id],
  }),
}));
