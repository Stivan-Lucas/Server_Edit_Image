// src/types/auth.ts
export type JwtPayload = {
	id: string;
	name: string;
	email: string;
	exp?: number;
	iat?: number;
};

export interface DecodedJwt {
	exp: number;
	iat: number;
	[key: string]: unknown;
}
