import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireRoles } from '../middlewares/auth.js'

const ticketPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])
const ticketStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED'])

const createTicketBodySchema = z.object({
	title: z.string().min(3),
	description: z.string().min(5),
	priority: ticketPrioritySchema
})

const updateStatusBodySchema = z.object({
	status: ticketStatusSchema,
	technicianId: z.string().optional()
})

const createCommentBodySchema = z.object({
	content: z.string().min(1),
	isInternal: z.boolean().default(false)
})

const listQuerySchema = z.object({
	status: ticketStatusSchema.optional(),
	priority: ticketPrioritySchema.optional()
})

const ticketIdParamsSchema = z.object({
	ticketId: z.string()
})

const updateTicketBodySchema = z.object({
	title: z.string().min(3).optional(),
	description: z.string().min(5).optional(),
	priority: ticketPrioritySchema.optional(),
	status: ticketStatusSchema.optional(),
	technicianId: z.string().nullable().optional()
})

function canAccessTicket(user: { sub: string; role: 'ADMIN' | 'TECHNICIAN' | 'CLIENT' }, ticket: { clientId: string; technicianId: string | null }) {
	if (user.role === 'ADMIN') {
		return true
	}

	if (user.role === 'CLIENT') {
		return ticket.clientId === user.sub
	}

	return ticket.technicianId === user.sub
}

export async function ticketsRoutes(app: FastifyInstance) {
	app.get('/tickets', { preHandler: [authenticate] }, async (request) => {
		const user = request.user
		const query = listQuerySchema.parse(request.query)

		const where: {
			status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
			priority?: 'LOW' | 'MEDIUM' | 'HIGH'
			clientId?: string
			technicianId?: string
		} = {}

		if (query.status) {
			where.status = query.status
		}

		if (query.priority) {
			where.priority = query.priority
		}

		if (user?.role === 'CLIENT') {
			where.clientId = user.sub
		}

		if (user?.role === 'TECHNICIAN') {
			where.technicianId = user.sub
		}

		return prisma.ticket.findMany({
			where,
			include: {
				client: { select: { id: true, name: true, email: true } },
				technician: { select: { id: true, name: true, email: true } },
				comments: {
					select: {
						id: true,
						content: true,
						isInternal: true,
						createdAt: true,
						author: { select: { id: true, name: true, role: true } }
					},
					orderBy: { createdAt: 'asc' }
				}
			},
			orderBy: { createdAt: 'desc' }
		})
	})

	app.get('/tickets/:ticketId', { preHandler: [authenticate] }, async (request, reply) => {
		const user = request.user

		if (!user) {
			return reply.status(401).send({ message: 'Não autenticado' })
		}

		const params = ticketIdParamsSchema.parse(request.params)
		const ticket = await prisma.ticket.findUnique({
			where: { id: params.ticketId },
			include: {
				client: { select: { id: true, name: true, email: true } },
				technician: { select: { id: true, name: true, email: true } },
				comments: {
					select: {
						id: true,
						content: true,
						isInternal: true,
						createdAt: true,
						author: { select: { id: true, name: true, role: true } }
					},
					orderBy: { createdAt: 'asc' }
				}
			}
		})

		if (!ticket) {
			return reply.status(404).send({ message: 'Chamado não encontrado' })
		}

		if (!canAccessTicket(user, ticket)) {
			return reply.status(403).send({ message: 'Sem permissão para acessar este chamado' })
		}

		return reply.send(ticket)
	})

	app.post('/tickets', { preHandler: [authenticate] }, async (request, reply) => {
		const user = request.user

		if (!user) {
			return reply.status(401).send({ message: 'Não autenticado' })
		}

		const body = createTicketBodySchema.parse(request.body)

		const ticket = await prisma.ticket.create({
			data: {
				title: body.title,
				description: body.description,
				priority: body.priority,
				status: 'OPEN',
				clientId: user.sub
			},
			include: {
				client: { select: { id: true, name: true, email: true } }
			}
		})

		return reply.status(201).send(ticket)
	})

	app.patch('/tickets/:ticketId', { preHandler: [authenticate] }, async (request, reply) => {
		const user = request.user

		if (!user) {
			return reply.status(401).send({ message: 'Não autenticado' })
		}

		const params = ticketIdParamsSchema.parse(request.params)
		const body = updateTicketBodySchema.parse(request.body)

		const currentTicket = await prisma.ticket.findUnique({ where: { id: params.ticketId } })
		if (!currentTicket) {
			return reply.status(404).send({ message: 'Chamado não encontrado' })
		}

		if (!canAccessTicket(user, currentTicket)) {
			return reply.status(403).send({ message: 'Sem permissão para editar este chamado' })
		}

		if (user.role === 'CLIENT' && (body.status || body.technicianId !== undefined)) {
			return reply.status(403).send({ message: 'Cliente não pode alterar status ou técnico do chamado' })
		}

		if (user.role === 'TECHNICIAN' && body.technicianId && body.technicianId !== user.sub) {
			return reply.status(403).send({ message: 'Técnico só pode se autoatribuir' })
		}

		const ticket = await prisma.ticket.update({
			where: { id: params.ticketId },
			data: {
				title: body.title,
				description: body.description,
				priority: body.priority,
				status: body.status,
				technicianId: body.technicianId
			},
			include: {
				client: { select: { id: true, name: true, email: true } },
				technician: { select: { id: true, name: true, email: true } }
			}
		})

		return reply.send(ticket)
	})

	app.delete('/tickets/:ticketId', { preHandler: [authenticate] }, async (request, reply) => {
		const user = request.user

		if (!user) {
			return reply.status(401).send({ message: 'Não autenticado' })
		}

		const params = ticketIdParamsSchema.parse(request.params)
		const currentTicket = await prisma.ticket.findUnique({ where: { id: params.ticketId } })

		if (!currentTicket) {
			return reply.status(404).send({ message: 'Chamado não encontrado' })
		}

		if (user.role !== 'ADMIN' && currentTicket.clientId !== user.sub) {
			return reply.status(403).send({ message: 'Sem permissão para excluir este chamado' })
		}

		await prisma.ticket.delete({ where: { id: params.ticketId } })
		return reply.status(204).send()
	})

	app.patch(
		'/tickets/:ticketId/status',
		{ preHandler: [authenticate, requireRoles(['ADMIN', 'TECHNICIAN'])] },
		async (request, reply) => {
			const params = z.object({ ticketId: z.string() }).parse(request.params)
			const body = updateStatusBodySchema.parse(request.body)

			const currentTicket = await prisma.ticket.findUnique({ where: { id: params.ticketId } })

			if (!currentTicket) {
				return reply.status(404).send({ message: 'Chamado não encontrado' })
			}

			const user = request.user
			const technicianId = body.technicianId ?? (user?.role === 'TECHNICIAN' ? user.sub : currentTicket.technicianId)

			const ticket = await prisma.ticket.update({
				where: { id: params.ticketId },
				data: {
					status: body.status,
					technicianId
				}
			})

			return reply.send(ticket)
		}
	)

	app.post('/tickets/:ticketId/comments', { preHandler: [authenticate] }, async (request, reply) => {
		const params = z.object({ ticketId: z.string() }).parse(request.params)
		const body = createCommentBodySchema.parse(request.body)
		const user = request.user

		if (!user) {
			return reply.status(401).send({ message: 'Não autenticado' })
		}

		const ticket = await prisma.ticket.findUnique({ where: { id: params.ticketId } })
		if (!ticket) {
			return reply.status(404).send({ message: 'Chamado não encontrado' })
		}

		if (user.role === 'CLIENT' && body.isInternal) {
			return reply.status(403).send({ message: 'Cliente não pode criar comentário interno' })
		}

		const comment = await prisma.comment.create({
			data: {
				ticketId: params.ticketId,
				authorId: user.sub,
				content: body.content,
				isInternal: body.isInternal
			},
			include: {
				author: { select: { id: true, name: true, role: true } }
			}
		})

		return reply.status(201).send(comment)
	})
}
