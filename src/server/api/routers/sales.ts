import { products, saleDetails, saleDetailSchema, sales, saleSchema } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const saleRouter = createTRPCRouter({
  fetchAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(sales);
  }),
  create: protectedProcedure
    .input(z.object({
      data: z.object({
        saleDetails: z.array(saleDetailSchema.insert.omit({ createdAt: true, updatedAt: true, id: true })),
        sale: saleSchema.insert.omit({ createdAt: true, updatedAt: true, id: true })
      })
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.data.saleDetails.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sale details are required"
        });
      }

      const [sale] = await ctx.db.insert(sales).values({
        totalPrice: input.data.sale.totalPrice,
        userId: input.data.sale.userId,
        customerId: input.data.sale.customerId
      }).returning();

      if (!sale) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create sale"
        });
      }

      for (const detail of input.data.saleDetails) {
        if (!detail.productId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Product ID is required"
          });
        }
        if (!detail.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Quantity is required"
          });
        }
        if (!detail.price) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Price is required"
          });
        }

        const [product] = await ctx.db
          .select()
          .from(products)
          .where(eq(products.id, detail.productId));

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found"
          });
        }

        await ctx.db.update(products).set({
          stock: (Number(product.stock) - Number(detail.quantity)).toString()
        }).where(eq(products.id, detail.productId));

        await ctx.db.insert(saleDetails).values({
          saleId: sale.id,
          productId: detail.productId,
          quantity: detail.quantity,
          price: detail.price
        });
      }

      return true;
    })
});
