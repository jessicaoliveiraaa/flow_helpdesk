import { NavLink } from 'react-router-dom'
import type { User } from '../types'

type AppLayoutProps = {
	user: User
	onLogout: () => void
	children: React.ReactNode
}

export function AppLayout({ user, onLogout, children }: AppLayoutProps) {
	return (
		<div className="page-shell relative md:grid md:grid-cols-[280px_1fr]">
			<div className="aurora-overlay" />
			<div className="noise-texture" />

			<aside className="enter-rise relative z-10 bg-slate-950/85 text-slate-100 p-5 md:min-h-screen md:border-r md:border-white/10 md:backdrop-blur-md">
				<h1 className="text-2xl font-bold tracking-tight text-white">Flow Helpdesk</h1>
				<p className="mt-2 text-sm text-slate-300">{user.name}</p>
				<p className="text-xs uppercase tracking-wide text-cyan-300">{user.role}</p>

				<nav className="mt-8 flex flex-col gap-2">
					<NavLink
						to="/"
						className={({ isActive }) =>
							`rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-cyan-400 text-slate-900 font-semibold shadow-lg shadow-cyan-500/20' : 'hover:bg-white/10'}`
						}
					>
						Painel
					</NavLink>

					{user.role === 'ADMIN' && (
						<NavLink
							to="/usuarios"
							className={({ isActive }) =>
								`rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-cyan-400 text-slate-900 font-semibold shadow-lg shadow-cyan-500/20' : 'hover:bg-white/10'}`
							}
						>
							Usuários
						</NavLink>
					)}
				</nav>

				<button
					onClick={onLogout}
					className="mt-8 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-900 py-2.5 text-sm font-semibold transition hover:from-cyan-300 hover:to-teal-200"
				>
					Sair
				</button>
			</aside>

			<main className="enter-soft relative z-10 p-4 md:p-8">{children}</main>
		</div>
	)
}
