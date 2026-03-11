import { execSync } from 'node:child_process'
import { app } from './app.js'
import { env } from './config/env.js'

async function bootstrap() {
  try {
    if (env.NODE_ENV === 'production') {
      console.log('Rodando migrations...')
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
      console.log('Migrations concluídas.')
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