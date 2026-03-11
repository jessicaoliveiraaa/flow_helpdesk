import { FormEvent, useEffect, useState } from 'react'
import { createUser, listUsers } from '../lib/api'
import { useToast } from '../contexts/toast-context'
import type { User } from '../types'

type UsersPageProps = {
	token: string
}

const roleLabel: Record<string, string> = {
	ADMIN: 'Administrador',
	TECHNICIAN: 'Técnico',
	CLIENT: 'Cliente'
}

export function UsersPage({ token }: UsersPageProps) {
	const { toast } = useToast()
	const [users, setUsers] = useState<User[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [role, setRole] = useState<'ADMIN' | 'TECHNICIAN' | 'CLIENT'>('CLIENT')
	const [isSaving, setIsSaving] = useState(false)

	async function load() {
		setIsLoading(true)
		try {
			setUsers(await listUsers(token))
		} catch (err) {
			toast(err instanceof Error ? err.message : 'Falha ao carregar usuários', 'error')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => { void load() }, [token])

	async function handleCreate(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setIsSaving(true)
		try {
			await createUser(token, { name, email, password, role })
			setName('')
			setEmail('')
			setPassword('')
			setRole('CLIENT')
			await load()
			toast('Usuário criado com sucesso!', 'success')
		} catch (err) {
			toast(err instanceof Error ? err.message : 'Falha ao criar usuário', 'error')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className="space-y-5">
			<header className="enter-rise">
				<p className="text-xs uppercase tracking-[0.2em] text-slate-300">Administração</p>
				<h2 className="mt-1 text-3xl font-bold text-white">Usuários</h2>
				<p className="text-sm text-slate-200/90 mt-2">Gerencie os membros da equipe e clientes.</p>
			</header>

			<section className="glass-panel enter-rise rounded-2xl p-5" style={{ animationDelay: '120ms' }}>
				<h3 className="text-lg font-semibold text-slate-900">Novo usuário</h3>
				<form onSubmit={handleCreate} className="mt-4 grid gap-3 sm:grid-cols-2">
					<input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Nome completo"
						required
						className="rounded-xl border border-slate-300/90 bg-white/90 px-3 py-2.5 text-sm"
					/>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="E-mail"
						required
						className="rounded-xl border border-slate-300/90 bg-white/90 px-3 py-2.5 text-sm"
					/>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Senha"
						required
						minLength={6}
						className="rounded-xl border border-slate-300/90 bg-white/90 px-3 py-2.5 text-sm"
					/>
					<select
						value={role}
						onChange={(e) => setRole(e.target.value as 'ADMIN' | 'TECHNICIAN' | 'CLIENT')}
						aria-label="Perfil"
						className="rounded-xl border border-slate-300/90 bg-white/90 px-3 py-2.5 text-sm"
					>
						<option value="CLIENT">Cliente</option>
						<option value="TECHNICIAN">Técnico</option>
						<option value="ADMIN">Administrador</option>
					</select>
					<button
						type="submit"
						disabled={isSaving}
						className="sm:col-span-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 px-4 py-2.5 font-semibold text-slate-900 transition hover:from-cyan-300 hover:to-teal-200 disabled:opacity-70"
					>
						{isSaving ? 'Criando...' : 'Criar usuário'}
					</button>
				</form>
			</section>

			<section className="glass-panel enter-rise rounded-2xl p-5" style={{ animationDelay: '220ms' }}>
				<h3 className="text-lg font-semibold text-slate-900">Membros</h3>

				{isLoading && <p className="mt-3 text-sm text-slate-700">Carregando usuários...</p>}
				{!isLoading && users.length === 0 && <p className="mt-3 text-sm text-slate-700">Nenhum usuário encontrado.</p>}

				<ul className="mt-4 divide-y divide-slate-200">
					{users.map((u, i) => (
						<li
							key={u.id}
							className="py-3 flex items-center justify-between gap-3 enter-rise"
							style={{ animationDelay: `${i * 60 + 280}ms` }}
						>
							<div>
								<p className="font-medium text-slate-900">{u.name}</p>
								<p className="text-sm text-slate-500">{u.email}</p>
							</div>
							<span className="text-xs px-2 py-1 rounded-full bg-cyan-100 text-cyan-900">
								{roleLabel[u.role] ?? u.role}
							</span>
						</li>
					))}
				</ul>
			</section>
		</div>
	)
}

