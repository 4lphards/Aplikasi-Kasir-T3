import { products, saleDetails, saleDetailSchema, sales, saleSchema } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, eq, gte, lte, sql, sum } from "drizzle-orm";
import { startOfWeek, endOfDay, startOfDay, addDays } from "date-fns";

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
          message: "detail Penjualan diperlukan"
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
          message: "Gagal membuat penjualan"
        });
      }

      for (const detail of input.data.saleDetails) {
        if (!detail.productId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ID Produk diperlukan"
          });
        }
        if (!detail.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Kuantitas diperlukan"
          });
        }
        if (!detail.price) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Harga diperlukan"
          });
        }

        const [product] = await ctx.db
          .select()
          .from(products)
          .where(eq(products.id, detail.productId));

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Produk tidak ditemukan"
          });
        }

        await ctx.db.update(products).set({
          stock: Number(product.stock) - Number(detail.quantity)
        }).where(eq(products.id, detail.productId));

        await ctx.db.insert(saleDetails).values({
          saleId: sale.id,
          productId: detail.productId,
          quantity: detail.quantity,
          price: detail.price
        });
      }

      return true;
    }),
  fetchDailySales: protectedProcedure
    .query(async ({ ctx }) => {
      const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const endDate = addDays(startDate, 6);

      const salesData = await ctx.db
        .select({
          createdAt: sql<string>`DATE_TRUNC('day', ${sales.createdAt})`,
          totalPrice: sum(sales.totalPrice)
        })
        .from(sales)
        .where(and(
          gte(sales.createdAt, startOfDay(startDate)),
          lte(sales.createdAt, endOfDay(endDate))
        ))
        .groupBy(sql`DATE_TRUNC('day', ${sales.createdAt})`);

      const dailySales: number[] = Array<number>(7).fill(0);

      salesData.forEach((sale) => {
        const dayIndex = (new Date(sale.createdAt).getDay() + 6) % 7; // Adjust for week starting on Monday
        dailySales[dayIndex] = Number(sale.totalPrice);
      });

      return dailySales;
    }),
  fetchSalesNow: protectedProcedure
    .query(async ({ ctx }) => {
      const startDate = startOfDay(new Date());
      const endDate = endOfDay(new Date());

      const salesData = await ctx.db
        .select({
          createdAt: sales.createdAt,
          totalPrice: sales.totalPrice,
          totalQuantity: sum(saleDetails.quantity)
        })
        .from(sales)
        .where(and(
          gte(sales.createdAt, startDate),
          lte(sales.createdAt, endDate)
        ))
        .leftJoin(saleDetails, eq(sales.id, saleDetails.saleId))
        .groupBy(sales.createdAt, sales.totalPrice);

      const [TotalPrice] = await ctx.db
        .select({
          totalPrice: sum(sales.totalPrice)
        }).from(sales)
        .where(and(
          gte(sales.createdAt, startDate),
          lte(sales.createdAt, endDate)
        ));

      const [productSold] = await ctx.db
        .select({
          totalQuantity: sum(saleDetails.quantity)
        })
        .from(saleDetails)
        .where(and(
          gte(saleDetails.createdAt, startDate),
          lte(saleDetails.createdAt, endDate)
        ));

      return {
        salesData,
        TotalPrice,
        productSold
      };
    })
});
