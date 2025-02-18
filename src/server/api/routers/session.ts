import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { users, userSchema } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { verify } from "@node-rs/argon2";
import { jwt } from "@/lib/jwt";

export const sessionRouter = createTRPCRouter({
  create: publicProcedure
    .input(userSchema.select.pick({ username: true, password: true }))
    .mutation(async ({ input, ctx }) => {
      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.username, input.username));

      if (user === undefined)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials"
        });

      if ((await verify(user.password, input.password)) === false)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials"
        });

      ctx.cookies.set("session", jwt.sign({ id: user.id }), {
        httpOnly: true
      });

      return {
        id: user.id,
        name: user.name,
        level: user.level
      };
    }),
  read: protectedProcedure.query(async ({ ctx }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = ctx.user;

    return user;
  }),
  remove: protectedProcedure.mutation(async ({ ctx }) => {
    ctx.cookies.set("session", "", {
      httpOnly: true
    });

    return true;
  })
});
