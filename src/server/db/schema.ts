import { sql } from "drizzle-orm";
import {
	decimal,
	integer,
	pgEnum,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const userLevels = pgEnum("user_level", ["admin", "user"]);

export const users = pgTable("user", {
	id: integer().primaryKey().generatedByDefaultAsIdentity(),
	name: varchar({ length: 256 }),
	username: varchar({ length: 50 }).unique().notNull(),
	password: varchar({ length: 256 }).notNull(),
	level: userLevels().default("user"),
	passwordUpdatedAt: timestamp({ withTimezone: true }),
	createdAt: timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
});

export const products = pgTable("product", {
	id: integer().primaryKey().generatedByDefaultAsIdentity(),
	name: varchar({ length: 256 }),
	price: decimal({ precision: 10, scale: 2 }),
	stock: decimal({ precision: 10, scale: 2 }),
	createdAt: timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
});

export const customers = pgTable("customer", {
	id: integer().primaryKey().generatedByDefaultAsIdentity(),
	name: varchar({ length: 256 }),
	phone: varchar({ length: 50 }),
	address: varchar({ length: 256 }),
	createdAt: timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
});

export const sales = pgTable("sale", {
	id: integer().primaryKey().generatedByDefaultAsIdentity(),
	totalPrice: decimal({ precision: 10, scale: 2 }),
	userId: integer().references(() => users.id, {
		onDelete: "restrict",
		onUpdate: "cascade",
	}),
	customerId: integer("customer_id").references(() => customers.id, {
		onDelete: "restrict",
		onUpdate: "cascade",
	}),
	createdAt: timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
});

export const saleDetails = pgTable("sale_detail", {
	id: integer().primaryKey().generatedByDefaultAsIdentity(),
	saleId: integer().references(() => sales.id, {
		onDelete: "restrict",
		onUpdate: "cascade",
	}),
	productId: integer().references(() => products.id, {
		onDelete: "restrict",
		onUpdate: "cascade",
	}),
	quantity: decimal({ precision: 10, scale: 2 }),
	price: decimal({ precision: 10, scale: 2 }),
	createdAt: timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
});

export const userSchema = {
	insert: createInsertSchema(users),
	select: createSelectSchema(users),
};

export const productSchema = {
	insert: createInsertSchema(products),
	select: createSelectSchema(products),
};

export const customerSchema = {
	insert: createInsertSchema(customers),
	select: createSelectSchema(customers),
};

export const saleSchema = {
	insert: createInsertSchema(sales),
	select: createSelectSchema(sales),
};

export const saleDetailSchema = {
	insert: createInsertSchema(saleDetails),
	select: createSelectSchema(saleDetails),
};
