// src/constants/all-texts.ts
export const allTexts = {
	server: {
		documentation: `Documentation listening at {address}/docs`,
	},

	environment: {
		errors: {
			envValidation: {
				description:
					"One or more environment variables are missing or invalid.",
			},
		},
	},

	rateLimit: {
		approachingLimit: "Client {ip} is approaching the limit",
		limitExceeded: "Client {ip} has exceeded the limit",
		banned: "Client {ip} has been banned due to excessive requests",
		logExceeded: "Limit exceeded for {ip} - {method}:{url}",
		error: "Too Many Requests",
		message:
			"You have exceeded the limit of {max} requests per {after}. Please try again later.",
		code: "LIMIT_EXCEEDED",
		bannedMessage:
			"Your access has been temporarily suspended due to excessive requests.",
		bannedError: "Access Blocked",
		bannedCode: "ACCESS_BLOCKED",
	},

	handleError: {
		errors: {
			validationError: {
				error: "Response Validation Error",
				message: "The request does not match the expected schema",
				logMessage: "Zod Validation Error",
			},
			serializationError: {
				error: "Internal Server Error",
				message: "The response does not match the expected schema",
				logMessage: "Response Serialization Error",
			},
			unexpectedError: {
				error: "Internal Server Error",
				message: "An unexpected error occurred.",
				logMessage: "Unexpected Error",
			},
			unknownError: {
				error: "Internal Server Error",
				message: "Erro inesperado sem detalhes disponíveis",
				logMessage: "Erro desconhecido capturado pelo handler global",
			},
		},
	},
};
