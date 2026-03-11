import { FormEvent, useState } from 'react'

type LoginPageProps = {
	onLogin: (email: string, password: string) => Promise<void>
}

export function LoginPage({ onLogin }: LoginPageProps) {
	const [email, setEmail] = useState('admin@helpdesk.com')
	const [password, setPassword] = useState('123456')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError(null)
		setIsSubmitting(true)

		try {
			await onLogin(email, password)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Falha no login')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<main className="page-shell grid place-items-center px-4 py-8 md:px-6">
			<div className="aurora-overlay" />
			<div className="noise-texture" />

			<section className="glass-panel enter-rise hover-lift relative z-10 w-full max-w-md rounded-3xl p-6 md:p-8">
				<p className="text-xs uppercase tracking-[0.24em] text-slate-500">Plataforma de Suporte</p>
				<h1 className="mt-2 text-3xl font-bold text-slate-900">Flow Helpdesk</h1>
				<p className="mt-2 text-sm text-slate-600">Entre para acompanhar chamados em tempo real.</p>

				<form onSubmit={handleSubmit} className="mt-7 space-y-4">
					<div>
						<label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
							Email
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
							className="w-full rounded-xl border border-slate-300/90 bg-white/90 px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-cyan-400"
						/>
					</div>

					<div>
						<label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
							Senha
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							required
							className="w-full rounded-xl border border-slate-300/90 bg-white/90 px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-cyan-400"
						/>
					</div>

					{error && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 py-2.5 font-semibold text-slate-900 transition hover:from-cyan-300 hover:to-teal-200 disabled:opacity-70"
					>
						{isSubmitting ? 'Entrando...' : 'Entrar'}
					</button>
				</form>

				<div className="enter-soft mt-5 flex items-center gap-2 text-xs text-slate-600">
					<span className="h-2 w-2 rounded-full bg-emerald-500" />
					<span>Sessao segura com JWT</span>
				</div>
			</section>
		</main>
	)
}
