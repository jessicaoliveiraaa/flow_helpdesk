/** @vitest-environment jsdom */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './login-page'

describe('LoginPage', () => {
	it('submits email and password', async () => {
		const onLogin = vi.fn().mockResolvedValue(undefined)
		const user = userEvent.setup()
		render(<LoginPage onLogin={onLogin} />)

		await user.clear(screen.getByLabelText('Email'))
		await user.type(screen.getByLabelText('Email'), 'user@test.com')
		await user.clear(screen.getByLabelText('Senha'))
		await user.type(screen.getByLabelText('Senha'), '123456')
		await user.click(screen.getByRole('button', { name: 'Entrar' }))

		await waitFor(() => {
			expect(onLogin).toHaveBeenCalledWith('user@test.com', '123456')
		})
	})
})
