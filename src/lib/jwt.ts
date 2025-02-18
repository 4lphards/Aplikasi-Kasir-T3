import { env } from "@/env";
import fastJwt from "fast-jwt";

export const jwt = {
  sign: fastJwt.createSigner({ key: env.JWT_SECRET, expiresIn: "12h" }),
  verify: fastJwt.createVerifier({ key: env.JWT_SECRET })
};
