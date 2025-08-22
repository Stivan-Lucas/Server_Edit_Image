// src/modules/rate-limit.ts
import fastifyRateLimit from "@fastify/rate-limit";
import { allTexts } from "../constants/all-texts.ts";
import type { FastifyTypedInstance } from "../utils/zod.ts";
import { env, isDev, isProd, isTest } from "../env/environment.ts";

export default async function RateLimited(app: FastifyTypedInstance) {
	if (isTest) return;

	if (isDev) {
		app.log.info(env.RATE_LIMIT_INFO_MESSAGE);
		return;
	}

	if (isProd) {
		await app.register(fastifyRateLimit, {
			ban: env.RATE_LIMIT_BAN,
			max: env.RATE_LIMIT_MAX,
			cache: env.RATE_LIMIT_CACHE,
			timeWindow: env.RATE_LIMIT_WINDOW,
			nameSpace: env.RATE_LIMIT_NAMESPACE,
			global: true,
			skipOnError: true,
			enableDraftSpec: true,

			onExceeding: (request) => {
				app.log.info(
					allTexts.rateLimit.approachingLimit.replace("{ip}", request.ip),
				);
			},
			onExceeded: (request) => {
				app.log.warn(
					allTexts.rateLimit.limitExceeded.replace("{ip}", request.ip),
				);
			},
			onBanReach: (request) => {
				app.log.error(allTexts.rateLimit.banned.replace("{ip}", request.ip));
			},

			errorResponseBuilder: (request, context) => {
				app.log.warn(
					allTexts.rateLimit.logExceeded
						.replace("{ip}", request.ip)
						.replace("{method}", request.method)
						.replace("{url}", request.url),
				);

				return {
					statusCode: 429,
					error: allTexts.rateLimit.error,
					message: allTexts.rateLimit.message
						.replace("{max}", context.max.toString())
						.replace("{after}", context.after),
					codigo: allTexts.rateLimit.code,
					tempoEspera: context.after,
				};
			},
		});

		app.log.info(env.RATE_LIMIT_INFO_MESSAGE);
	}
}
