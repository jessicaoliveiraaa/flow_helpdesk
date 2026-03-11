import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.comment.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash('123456', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@helpdesk.com',
      password,
      role: 'ADMIN'
    }
  })

  const technician = await prisma.user.create({
    data: {
      name: 'Técnico Demo',
      email: 'tecnico@helpdesk.com',
      password,
      role: 'TECHNICIAN'
    }
  })

  const client = await prisma.user.create({
    data: {
      name: 'Cliente Demo',
      email: 'cliente@helpdesk.com',
      password,
      role: 'CLIENT'
    }
  })

  const ticket = await prisma.ticket.create({
    data: {
      title: 'Erro ao acessar o sistema',
      description: 'Não consigo entrar no painel após informar meu login.',
      priority: 'HIGH',
      status: 'OPEN',
      clientId: client.id
    }
  })

  await prisma.comment.createMany({
    data: [
      {
        content: 'Chamado criado pelo cliente.',
        ticketId: ticket.id,
        authorId: client.id,
        isInternal: false
      },
      {
        content: 'Analisar credenciais e retorno da autenticação.',
        ticketId: ticket.id,
        authorId: technician.id,
        isInternal: true
      }
    ]
  })

  console.log({
    admin: { email: admin.email, senha: '123456' },
    technician: { email: technician.email, senha: '123456' },
    client: { email: client.email, senha: '123456' }
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })