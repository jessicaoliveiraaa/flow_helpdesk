import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireRoles } from '../middlewares/auth.js'

const userRoleSchema = z.enum(['ADMIN', 'TECHNICIAN', 'CLIENT'])

const createUserBodySchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6),
	role: userRoleSchema
})

export async function usersRoutes(app: FastifyInstance) {
	app.get(
		'/users',
		{ preHandler: [authenticate, requireRoles(['ADMIN', 'TECHNICIAN'])] },
		async () => {
			const users = await prisma.user.findMany({
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					createdAt: true
				},
				orderBy: { createdAt: 'desc' }
			})

			return users
		}
	)

	app.post('/users', { preHandler: [authenticate, requireRoles(['ADMIN'])] }, async (request, reply) => {
		const body = createUserBodySchema.parse(request.body)

		const existingUser = await prisma.user.findUnique({ where: { email: body.email } })
		if (existingUser) {
			return reply.status(409).send({ message: 'Email já cadastrado' })
		}

		const password = await bcrypt.hash(body.password, 10)

		const user = await prisma.user.create({
			data: {
				name: body.name,
				email: body.email,
				password,
				role: body.role
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true
			}
		})

		return reply.status(201).send(user)
	})
}
