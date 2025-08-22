// src/app.ts
import Fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifyCors from "@fastify/cors";

import { env } from "./env/environment.ts";
import RateLimited from "./modules/rate-limit.ts";
import { loggerOptions } from "./modules/logger.ts";
import handleError from "./modules/handle-error.ts";

export const app = Fastify({
	logger: loggerOptions,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, { origin: env.CORS_ORIGIN });
app.register(handleError);

await RateLimited(app);

app.ready();
