import { products, productSchema } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const productRouter = createTRPCRouter({
  fetchAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(products);
  }),
  fetchById: protectedProcedure
    .input(productSchema.select.pick({ id: true }))
    .query(async ({ input, ctx }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product ID is required"
        });
      }

      const [product] = await ctx.db
        .select()
        .from(products)
        .where(eq(products.id, input.id));

      if (product === undefined) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found"
        });
      }

      return product;
    }),
  create: protectedProcedure
    .input(productSchema.insert.omit({ createdAt: true, updatedAt: true }))
    .mutation(async ({ input, ctx }) => {
      if (!input.name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name is required"
        });
      }

      await ctx.db.insert(products).values(input);
      return true;
    }),
  delete: protectedProcedure
    .input(productSchema.select.pick({ id: true }))
    .mutation(async ({ input, ctx }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product ID is required"
        });
      }

      await ctx.db.delete(products).where(eq(products.id, input.id));
      return true;
    }),
  update: protectedProcedure
    .input(productSchema.update.omit({ createdAt: true, updatedAt: true }))
    .mutation(async ({ input, ctx }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product ID is required"
        });
      }

      await ctx.db.update(products).set(input).where(eq(products.id, input.id));
      return true;
    })
});
