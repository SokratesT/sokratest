import { type InferSelectModel, relations } from "drizzle-orm";
import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Course = InferSelectModel<typeof courses>;

export const courseMember = pgTable(
  "courseMember",
  {
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id),
    role: text("role").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.courseId, table.userId],
    }),
  ],
);

export type CourseMember = InferSelectModel<typeof courses>;

export const coursesRelations = relations(courses, ({ one, many }) => ({
  organizationId: one(organization, {
    fields: [courses.organizationId],
    references: [organization.id],
  }),
}));
