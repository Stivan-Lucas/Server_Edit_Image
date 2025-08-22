// src/modules/logger.ts
import fs from "node:fs";
import path from "node:path";
import pino, { type Logger, type LoggerOptions } from "pino";
import type { FastifyRequest, FastifyReply } from "fastify";
import { env, isDev, isProd, isTest } from "../env/environment.ts";

// --- Garantir diretório de logs ---
const logDir = path.resolve(env.LOG_DIR);
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// --- Serializers ---
const reqSerializer = (req: FastifyRequest) => ({
	method: req.method,
	url: req.url,
	headers: isDev
		? req.headers
		: {
				"user-agent": req.headers["user-agent"],
				host: req.headers.host,
			},
});

const serializers: LoggerOptions["serializers"] = {
	req: reqSerializer,
	res: (reply: FastifyReply) => ({ statusCode: reply.statusCode }),
	err: pino.stdSerializers.err,
};

// --- Redact paths ---
const redactPaths: string[] = env.LOG_REDACT_PATHS
	? env.LOG_REDACT_PATHS.split(",").map((p) => p.trim())
	: [
			"req.headers.authorization",
			"req.headers.cookie",
			'req.headers["x-api-key"]',
			"*.password",
		];

// --- Transportes ---
let transport: LoggerOptions["transport"] | undefined;

if (isTest) {
	// Logger silencioso para testes
	transport = undefined;
} else if (isDev) {
	// Console bonito + arquivo de dev
	transport = {
		targets: [
			{
				target: "pino-pretty",
				options: {
					colorize: env.LOG_PRETTY_COLORIZE !== "false",
					translateTime:
						env.LOG_PRETTY_TRANSLATE_TIME || "SYS:yyyy-mm-dd HH:MM:ss",
					ignore: env.LOG_PRETTY_IGNORE || "pid,hostname",
					singleLine: env.LOG_PRETTY_SINGLE_LINE !== "false",
				},
				level: env.LOG_LEVEL,
			},
			{
				target: "pino/file",
				options: {
					destination: path.join(logDir, `app.${env.NODE_ENV}.log`),
					mkdir: true,
					append: true,
				},
				level: env.LOG_LEVEL,
			},
		],
	};
} else if (isProd) {
	// Produção → arquivo de log simples
	transport = {
		targets: [
			{
				target: "pino/file",
				options: {
					destination: path.join(logDir, `app.${env.NODE_ENV}.log`),
					mkdir: true,
					append: true,
				},
				level: env.LOG_LEVEL,
			},
			// opcional: segundo arquivo para rotação manual ou backup
			{
				target: "pino/file",
				options: {
					dirname: logDir,
					filename: `app-%DATE%-${env.NODE_ENV}.log`,
					mkdir: true,
					append: true,
				},
				level: env.LOG_LEVEL,
			},
		],
	};
}

// --- Configurações finais do logger ---
export const loggerOptions: LoggerOptions = {
	level: env.LOG_LEVEL,
	serializers,
	redact: { paths: redactPaths, censor: "**REDACTED**" },
	mixin: () => ({
		env: env.NODE_ENV,
		app: env.APP_NAME,
		version: env.APP_VERSION,
	}),
	transport,
};

// --- Instância do logger ---
export const logger: Logger = isTest
	? pino({ level: "silent" }) // logger silencioso em testes
	: pino(loggerOptions);
