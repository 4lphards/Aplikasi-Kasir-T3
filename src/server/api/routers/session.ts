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

			// Check if user exists and password is correct
			if (user === undefined)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Invalid credentials",
				});

			if ((await verify(user.password, input.password)) === false)
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Invalid credentials",
				});

			await ctx.cookies.set("session", jwt.sign({ id: user.id }), {
				httpOnly: true,
			});

			return {
				id: user.id,
				name: user.name,
				level: user.level,
			};
		}),
	read: protectedProcedure.query(async ({ ctx }) => {
		const { password, ...user } = ctx.user;

		return user;
	}),
	remove: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.cookies.set("session", "", {
			httpOnly: true,
		});

		return true;
	}),
});
