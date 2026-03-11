import { execSync } from 'node:child_process'
import bcrypt from 'bcryptjs'
import { app } from './app.js'
import { env } from './config/env.js'
import { prisma } from './lib/prisma.js'

async function seedInitialData() {
  const usersCount = await prisma.user.count()

  if (usersCount > 0) {
    return
  }

  console.log('Banco vazio detectado. Criando dados iniciais...')

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
      name: 'Tecnico Demo',
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
      description: 'Nao consigo entrar no painel apos informar meu login.',
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
        content: 'Analisar credenciais e retorno da autenticacao.',
        ticketId: ticket.id,
        authorId: technician.id,
        isInternal: true
      }
    ]
  })

  console.log(`Dados iniciais criados para ${admin.email}`)
}

async function bootstrap() {
  try {
    if (env.NODE_ENV === 'production') {
      console.log('Rodando migrations...')
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
      console.log('Migrations concluídas.')
      await seedInitialData()
    }
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    console.log(`Servidor rodando em http://localhost:${env.PORT}`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

async function shutdown(signal: string) {
  try {
    app.log.info(`Recebido ${signal}. Encerrando servidor...`)
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})

process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})

bootstrap()