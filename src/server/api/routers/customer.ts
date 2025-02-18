import { customers, customerSchema } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const customerRouter = createTRPCRouter({
  fetchAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(customers);
  }),

  create: protectedProcedure
    .input(customerSchema.insert.omit({ createdAt: true, updatedAt: true, id: true }))
    .mutation(async ({ input, ctx }) => {
      if (!input.name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name is required"
        });
      }

      await ctx.db.insert(customers).values(input);
      return true;
    }),
  delete: protectedProcedure
    .input(customerSchema.select.pick({ id: true }))
    .mutation(async ({ input, ctx }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Customer ID is required"
        });
      }

      await ctx.db.delete(customers).where(eq(customers.id, input.id));
      return true;
    }),
  update: protectedProcedure
    .input(customerSchema.update.omit({ createdAt: true, updatedAt: true }))
    .mutation(async ({ input, ctx }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Customer ID is required"
        });
      }

      await ctx.db
        .update(customers)
        .set(input)
        .where(eq(customers.id, input.id));
      return true;
    })
});
