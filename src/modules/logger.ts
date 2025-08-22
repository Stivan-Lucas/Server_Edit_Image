// src/modules/logger.ts
import fs from "node:fs";
import path from "node:path";
import pino, {
	type Logger,
	type LoggerOptions,
	type TransportTargetOptions,
} from "pino";
import type { FastifyRequest, FastifyReply } from "fastify";
import { env, isDev, isProd, isTest } from "../env/environment.ts";

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

// --- Transportes tipados ---
let transport: LoggerOptions["transport"] | undefined;

if (isTest) {
	// Dummy logger para testes
	transport = undefined;
} else if (isDev) {
	// Console bonito
	transport = {
		target: "pino-pretty",
		options: {
			colorize: env.LOG_PRETTY_COLORIZE,
			translateTime: env.LOG_PRETTY_TRANSLATE_TIME,
			ignore: env.LOG_PRETTY_IGNORE,
			singleLine: env.LOG_PRETTY_SINGLE_LINE,
		},
		level: env.LOG_LEVEL,
	} as TransportTargetOptions;
} else if (isProd) {
	// Arquivos rotacionados e comprimidos
	transport = {
		targets: [
			{
				target: "pino/file",
				options: {
					dirname: logDir,
					filename: `app-%DATE%-${env.NODE_ENV}.log`,
					datePattern: "YYYY-MM-DD",
					maxFiles: env.LOG_FILE_MAX_DAYS,
					zippedArchive: env.LOG_FILE_ZIPPED,
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
