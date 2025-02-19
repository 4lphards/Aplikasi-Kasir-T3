import { products, productSchema } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const productRouter = createTRPCRouter({
  fetchAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(products).where(eq(products.active, true));
  }),
  fetchById: protectedProcedure
    .input(productSchema.select.pick({ id: true }))
    .query(async ({ input, ctx }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID Produk diperlukan"
        });
      }

      const [product] = await ctx.db
        .select()
        .from(products)
        .where(and(eq(products.id, input.id), eq(products.active, true)));

      if (product === undefined) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produk tidak ditemukan"
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
          message: "Nama produk diperlukan"
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
          message: "ID Produk diperlukan"
        });
      }

      await ctx.db.update(products).set({
        active: false
      }).where(eq(products.id, input.id));

      return true;
    }),
  deleteBulk: protectedProcedure
    .input(z.array(productSchema.select.pick({ id: true })))
    .mutation(async ({ input, ctx }) => {
      if (input.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID Produk diperlukan"
        });
      }

      await ctx.db.update(products).set({
        active: false
      }).where(inArray(products.id, input.map(i => i.id)));

      return true;
    }),
  update: protectedProcedure
    .input(productSchema.update.omit({ createdAt: true, updatedAt: true }))
    .mutation(async ({ input, ctx }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID Produk diperlukan"
        });
      }

      await ctx.db.update(products).set(input).where(eq(products.id, input.id));
      return true;
    })
});
