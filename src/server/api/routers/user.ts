import { users, userSchema } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { and, eq, inArray } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  fetchAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(users).where(eq(users.active, true));
  }),
  fetchById: protectedProcedure
    .input(userSchema.select.pick({ id: true }))
    .query(async ({ input, ctx }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID User diperlukan!"
        });
      }

      const [user] = await ctx.db
        .select()
        .from(users)
        .where(and(eq(users.id, input.id), eq(users.active, true)));

      if (user === undefined) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User tidak ditemukan!"
        });
      }

      return user;
    }),
  create: protectedProcedure
    .input(
      userSchema.insert.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        passwordUpdatedAt: true
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.username) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username diperlukan!"
        });
      }
      if (!input.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password diperlukan!"
        });
      }

      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.username, input.username));

      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username sudah digunakan!"
        });
      }

      input.password = await hash(input.password);
      await ctx.db.insert(users).values(input);
      return true;
    }),
  delete: protectedProcedure
    .input(userSchema.select.pick({ id: true }))
    .mutation(async ({ input, ctx }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Id User diperlukan!"
        });
      }
      await ctx.db.update(users)
        .set({
          username: null,
          active: false
        }).where(eq(users.id, input.id));

      return true;
    }),
  deleteBulk: protectedProcedure
    .input(z.array(userSchema.select.pick({ id: true })))
    .mutation(async ({ input, ctx }) => {
      if (input.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID User diperlukan"
        });
      }

      await ctx.db.update(users)
        .set({
          username: null,
          active: false
        }).where(inArray(users.id, input.map(i => i.id)));

      return true;
    }),

  update: protectedProcedure
    .input(
      userSchema.update.omit({
        createdAt: true,
        updatedAt: true
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID User diperlukan!"
        });
      }
      if (input.password) {
        input.password = await hash(input.password);
        input.passwordUpdatedAt = new Date();
      }
      await ctx.db.update(users).set(input).where(eq(users.id, input.id));
      return true;
    })
});
