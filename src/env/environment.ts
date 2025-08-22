// src/env/environment.ts
import { z } from "zod";
import { config } from "@dotenvx/dotenvx";
import { allTexts } from "../constants/all-texts.ts";

config({
	path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
	override: true,
});

const envSchema = z.object({
	// Server
	HOST: z.string(),
	PORT: z.coerce.number(),
	APP_NAME: z.string(),
	APP_VERSION: z.string(),
	NODE_ENV: z.enum(["development", "production", "test"]),

	// Cors
	CORS_ORIGIN: z.string(),

	// Logging
	LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
	LOG_DIR: z.string(),
	LOG_PRETTY_COLORIZE: z.string().optional(), // 'true' | 'false'
	LOG_PRETTY_TRANSLATE_TIME: z.string().optional(),
	LOG_PRETTY_IGNORE: z.string().optional(),
	LOG_PRETTY_SINGLE_LINE: z.string().optional(),
	LOG_FILE_MAX_DAYS: z.coerce.number().optional(),
	LOG_FILE_ZIPPED: z.string().optional(), // 'true' | 'false'
	LOG_REDACT_PATHS: z.string().optional(), // csv: 'req.headers.authorization,*.password'

	// File Upload
	MAX_FILE_SIZE: z.coerce.number(),

	// Database (Postgres)
	DATABASE_URL: z.string(),
	POSTGRES_HOST: z.string().optional(),

	// Redis
	REDIS_HOST: z.string(),
	REDIS_PORT: z.coerce.number(),
	REDIS_PASSWORD: z.string().optional(),

	// JWT
	JWT_SECRET: z.string().min(32),
	JWT_EXPIRES_IN: z.string(),
	REFRESH_SECRET: z.string(),
	REFRESH_EXPIRES_IN: z.string(),

	// Rate Limit
	RATE_LIMIT_MAX: z.coerce.number(),
	RATE_LIMIT_WINDOW: z.string(),
	RATE_LIMIT_BAN: z.coerce.number(),
	RATE_LIMIT_CACHE: z.coerce.number(),
	RATE_LIMIT_NAMESPACE: z.string(),
	RATE_LIMIT_INFO_MESSAGE: z.string().optional(),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
	console.error(allTexts.environment.errors.envValidation.description);
	console.error(z.treeifyError(parseResult.error));
	process.exit(1);
}

export const env = parseResult.data;
export type Env = z.infer<typeof envSchema>;

export const isTest = env.NODE_ENV === "test";
export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";
