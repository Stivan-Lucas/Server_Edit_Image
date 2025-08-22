// src/types/user.d.ts
import { JwtPayload } from "./auth";
import "fastify";

declare module "fastify" {
	interface FastifyRequest {
		user?: JwtPayload;
	}
}
