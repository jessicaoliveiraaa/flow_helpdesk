import type { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { AuthTokenPayload } from '../types/auth.js'

declare module 'fastify' {
	interface FastifyRequest {
		user?: AuthTokenPayload
	}
}

function getBearerToken(authorizationHeader?: string) {
	if (!authorizationHeader) {
		return null
	}

	const [type, token] = authorizationHeader.split(' ')

	if (type !== 'Bearer' || !token) {
		return null
	}

	return token
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
	const token = getBearerToken(request.headers.authorization)

	if (!token) {
		return reply.status(401).send({ message: 'Token inválido ou ausente' })
	}

	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload
		request.user = decoded
	} catch {
		return reply.status(401).send({ message: 'Token inválido ou expirado' })
	}
}

export function requireRoles(roles: AuthTokenPayload['role'][]) {
	return async function ensureRole(request: FastifyRequest, reply: FastifyReply) {
		if (!request.user) {
			return reply.status(401).send({ message: 'Não autenticado' })
		}

		if (!roles.includes(request.user.role)) {
			return reply.status(403).send({ message: 'Sem permissão para esta ação' })
		}
	}
}
