import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { ZodError } from 'zod'
import { env } from './config/env.js'
import { authRoutes } from './routes/auth.js'
import { ticketsRoutes } from './routes/tickets.js'
import { usersRoutes } from './routes/users.js'

export const app = Fastify({ logger: true })

app.register(cors, {
	origin: env.NODE_ENV === 'production' ? env.CORS_ORIGIN ?? false : true
})

app.register(helmet, {
	global: true,
	contentSecurityPolicy: false
})

app.register(rateLimit, {
	global: false,
	max: env.RATE_LIMIT_MAX,
	timeWindow: env.RATE_LIMIT_WINDOW
})

app.setErrorHandler((error, _request, reply) => {
	if (error instanceof ZodError) {
		return reply.status(400).send({
			message: 'Dados inválidos',
			issues: error.issues.map((issue) => ({
				path: issue.path.join('.'),
				message: issue.message
			}))
		})
	}

	app.log.error(error)
	return reply.status(500).send({ message: 'Erro interno no servidor' })
})

app.get('/health', async () => {
	return { status: 'ok' }
})

app.register(authRoutes)
app.register(usersRoutes)
app.register(ticketsRoutes)
