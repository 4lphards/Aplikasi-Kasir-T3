import { users, userSchema } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  fetchAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(users);
  }),
  fetchById: protectedProcedure
    .input(userSchema.select.pick({ id: true }))
    .query(async ({ input, ctx }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User ID is required"
        });
      }

      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, input.id));

      if (user === undefined) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found"
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
          message: "Username is required"
        });
      }
      if (!input.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password is required"
        });
      }

      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.username, input.username));

      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already exists"
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
          message: "User ID is required"
        });
      }
      await ctx.db.delete(users).where(eq(users.id, input.id));
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
          message: "User ID is required"
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
