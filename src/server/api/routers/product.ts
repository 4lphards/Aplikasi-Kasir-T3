import { products } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const productRouter = createTRPCRouter({
	fetchAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.select().from(products);
	}),
});
