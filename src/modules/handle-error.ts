// src/modules/handle-error.ts
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import {
	hasZodFastifySchemaValidationErrors,
	isResponseSerializationError,
} from "fastify-type-provider-zod";
import { allTexts } from "../constants/all-texts.ts";
import type { FastifyTypedInstance } from "../utils/zod.ts";

export default function handleError(app: FastifyTypedInstance) {
	app.setErrorHandler(
		(err: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
			// --- Zod Validation Error ---
			if (hasZodFastifySchemaValidationErrors(err)) {
				app.log.warn(
					{ err, method: req.method, url: req.url },
					allTexts.handleError.errors.validationError.logMessage,
				);
				return reply.code(400).send({
					error: allTexts.handleError.errors.validationError.error,
					message: allTexts.handleError.errors.validationError.message,
					statusCode: 400,
					details: {
						issues: err.validation,
						method: req.method,
						url: req.url,
					},
				});
			}

			// --- Serialization Error ---
			if (isResponseSerializationError(err)) {
				app.log.error(
					{ err, method: err.method, url: err.url },
					allTexts.handleError.errors.serializationError.logMessage,
				);
				return reply.code(500).send({
					error: allTexts.handleError.errors.serializationError.error,
					message: allTexts.handleError.errors.serializationError.message,
					statusCode: 500,
					details: {
						issues: err.cause?.issues ?? [],
						method: err.method,
						url: err.url,
					},
				});
			}

			// --- Erros gerais não definidos ---
			if (err instanceof Error) {
				app.log.error(
					{ err, method: req.method, url: req.url },
					allTexts.handleError.errors.unexpectedError.logMessage,
				);
				return reply.code(500).send({
					error: allTexts.handleError.errors.unexpectedError.error,
					message:
						err.message || allTexts.handleError.errors.unexpectedError.message,
					statusCode: 500,
				});
			}

			// --- Fallback para qualquer outro tipo desconhecido ---
			app.log.error(
				{ err, method: req.method, url: req.url },
				allTexts.handleError.errors.unknownError.logMessage,
			);
			return reply.code(500).send({
				error: allTexts.handleError.errors.unknownError.error,
				message: allTexts.handleError.errors.unknownError.message,
				statusCode: 500,
			});
		},
	);
}
