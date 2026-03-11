import { describe, it, expect, afterAll } from 'vitest'
import { app } from './app.js'

describe('server app', () => {
	afterAll(async () => {
		await app.close()
	})

	it('returns ok on health endpoint', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/health'
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual({ status: 'ok' })
	})

	it('returns 400 on invalid login payload', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/auth/login',
			payload: { email: 'invalido' }
		})

		expect(response.statusCode).toBe(400)
		expect(response.json()).toHaveProperty('message', 'Dados inválidos')
	})
})
