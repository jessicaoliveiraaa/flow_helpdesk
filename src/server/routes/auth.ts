import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { env } from '../config/env.js'
import { authenticate } from '../middlewares/auth.js'
import { getProfile, loginWithEmailAndPassword } from '../services/auth-service.js'

const loginBodySchema = z.object({
	email: z.string().email(),
	password: z.string().min(1)
})

export async function authRoutes(app: FastifyInstance) {
	app.post('/auth/login', {
		config: {
			rateLimit: {
				max: env.RATE_LIMIT_MAX,
				timeWindow: env.RATE_LIMIT_WINDOW
			}
		}
	}, async (request, reply) => {
		const { email, password } = loginBodySchema.parse(request.body)

		try {
			const data = await loginWithEmailAndPassword(email, password)
			return reply.send(data)
		} catch {
			return reply.status(401).send({ message: 'Credenciais inválidas' })
		}
	})

	app.get('/auth/me', { preHandler: [authenticate] }, async (request, reply) => {
		const userId = request.user?.sub

		if (!userId) {
			return reply.status(401).send({ message: 'Não autenticado' })
		}

		const user = await getProfile(userId)

		if (!user) {
			return reply.status(404).send({ message: 'Usuário não encontrado' })
		}

		return reply.send(user)
	})
}
