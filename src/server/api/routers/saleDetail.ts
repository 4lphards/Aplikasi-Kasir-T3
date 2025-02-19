import { saleDetails } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const saleDetailsRouter = createTRPCRouter({
  fetchAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(saleDetails);
  })
});
