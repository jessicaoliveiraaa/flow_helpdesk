import { FormEvent, useEffect, useState } from 'react'
import { createComment, createTicket, deleteTicket, listTickets, updateTicket } from '../lib/api'
import { useToast } from '../contexts/toast-context'
import type { Ticket, User } from '../types'

type DashboardPageProps = {
	user: User
	token: string
}

export function DashboardPage({ user, token }: DashboardPageProps) {
	const { toast } = useToast()
	const [tickets, setTickets] = useState<Ticket[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
	const [isCreating, setIsCreating] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const [filterStatus, setFilterStatus] = useState('')
	const [filterPriority, setFilterPriority] = useState('')

	const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)
	const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
	const [isInternalFlags, setIsInternalFlags] = useState<Record<string, boolean>>({})
	const [isPostingComment, setIsPostingComment] = useState(false)

	async function loadTickets() {
		setIsLoading(true)
		try {
			const response = await listTickets(token, {
				status: filterStatus || undefined,
				priority: filterPriority || undefined
			})
			setTickets(response)
		} catch (err) {
			toast(err instanceof Error ? err.message : 'Falha ao carregar chamados', 'error')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		void loadTickets()
	}, [token, filterStatus, filterPriority])

	async function handleCreateTicket(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setIsCreating(true)
		try {
			await createTicket(token, { title, description, priority })
			setTitle('')
			setDescription('')
			setPriority('MEDIUM')
			await loadTickets()
			toast('Chamado criado com sucesso!', 'success')
		} catch (err) {
			toast(err instanceof Error ? err.message : 'Falha ao criar chamado', 'error')
		} finally {
			setIsCreating(false)
		}
	}

	async function handleStatusChange(ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') {
		setIsSaving(true)
		try {
			await updateTicket(token, ticketId, { status, technicianId: user.role === 'TECHNICIAN' ? user.id : undefined })
			await loadTickets()
			const label = status === 'IN_PROGRESS' ? 'Em andamento' : 'Resolvido'
			toast(`Status atualizado: ${label}`, 'success')
		} catch (err) {
			toast(err instanceof Error ? err.message : 'Falha ao atualizar chamado', 'error')
		} finally {
			setIsSaving(false)
		}
	}

	async function handleDelete(ticketId: string) {
		if (!window.confirm('Deseja excluir este chamado?')) return
		setIsSaving(true)
		try {
			await deleteTicket(token, ticketId)
			if (expandedTicketId === ticketId) setExpandedTicketId(null)
			await loadTickets()
			toast('Chamado excluído.', 'info')
		} catch (err) {
			toast(err instanceof Error ? err.message : 'Falha ao excluir chamado', 'error')
		} finally {
			setIsSaving(false)
		}
	}

	async function handlePostComment(ticketId: string) {
		const content = commentTexts[ticketId]?.trim()
		if (!content) return
		setIsPostingComment(true)
		try {
			await createComment(token, ticketId, {
				content,
				isInternal: isInternalFlags[ticketId] ?? false
			})
			setCommentTexts((prev) => ({ ...prev, [ticketId]: '' }))
			setIsInternalFlags((prev) => ({ ...prev, [ticketId]: false }))
			await loadTickets()
			toast('Comentário adicionado!', 'success')
		} catch (err) {
			toast(err instanceof Error ? err.message : 'Falha ao enviar comentário', 'error')
		} finally {
			setIsPostingComment(false)
		}
	}

	const canCreate = user.role === 'CLIENT' || user.role === 'ADMIN'

	const priorityLabel: Record<'LOW' | 'MEDIUM' | 'HIGH', string> = {
		LOW: 'Baixa',
		MEDIUM: 'Média',
		HIGH: 'Alta'
	}

	const statusLabel: Record<'OPEN' | 'IN_PROGRESS' | 'RESOLVED', string> = {
		OPEN: 'Aberto',
		IN_PROGRESS: 'Em andamento',
		RESOLVED: 'Resolvido'
	}

	const titleByRole =
		user.role === 'CLIENT'
			? 'Painel do Cliente'
			: user.role === 'TECHNICIAN'
				? 'Painel do Técnico'
				: 'Painel do Administrador'

	return (
		<div className="space-y-5">
			<header className="enter-rise">
				<p className="text-xs uppercase tracking-[0.2em] text-slate-300">Workspace</p>
				<h2 className="mt-1 text-3xl font-bold text-white">{titleByRole}</h2>
				<p className="text-sm text-slate-200/90 mt-2">Acompanhe e gerencie os chamados do helpdesk.</p>
			</header>

			{canCreate && (
				<section className="glass-panel enter-rise rounded-2xl p-5" style={{ animationDelay: '120ms' }}>
					<h3 className="text-lg font-semibold text-slate-900">Novo chamado</h3>
					<p className="mt-1 text-sm text-slate-600">
						Defina a urgência do problema: Baixa (pode esperar), Média (impacta o uso) e Alta (precisa de suporte imediato).
					</p>
					<form onSubmit={handleCreateTicket} className="mt-4 grid gap-3 md:grid-cols-2">
						<input
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							placeholder="Título"
							required
							className="rounded-xl border border-slate-300/90 bg-white/90 px-3 py-2.5"
						/>
						<select
							value={priority}
							onChange={(event) => setPriority(event.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
							aria-label="Urgência"
							className="rounded-xl border border-slate-300/90 bg-white/90 px-3 py-2.5"
						>
							<option value="LOW">Baixa</option>
							<option value="MEDIUM">Média</option>
							<option value="HIGH">Alta</option>
						</select>
						<textarea
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="Descrição"
							required
							className="rounded-xl border border-slate-300/90 bg-white/90 px-3 py-2.5 md:col-span-2"
						/>
						<button
							type="submit"
							disabled={isCreating}
							className="rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 px-4 py-2.5 font-semibold text-slate-900 transition hover:from-cyan-300 hover:to-teal-200 disabled:opacity-70"
						>
							{isCreating ? 'Criando...' : 'Criar chamado'}
						</button>
					</form>
				</section>
			)}

			<section className="glass-panel enter-rise rounded-2xl p-5" style={{ animationDelay: '220ms' }}>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<h3 className="text-lg font-semibold text-slate-900">Chamados</h3>
					<div className="flex gap-2">
						<select
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
							aria-label="Filtrar por status"
							className="rounded-lg border border-slate-300/90 bg-white/90 px-2 py-1.5 text-sm"
						>
							<option value="">Todos os status</option>
							<option value="OPEN">Aberto</option>
							<option value="IN_PROGRESS">Em andamento</option>
							<option value="RESOLVED">Resolvido</option>
						</select>
						<select
							value={filterPriority}
							onChange={(e) => setFilterPriority(e.target.value)}
							aria-label="Filtrar por urgência"
							className="rounded-lg border border-slate-300/90 bg-white/90 px-2 py-1.5 text-sm"
						>
							<option value="">Todas as urgências</option>
							<option value="LOW">Baixa</option>
							<option value="MEDIUM">Média</option>
							<option value="HIGH">Alta</option>
						</select>
					</div>
				</div>

				{isLoading && <p className="mt-3 text-sm text-slate-700">Carregando chamados...</p>}
				{!isLoading && tickets.length === 0 && <p className="mt-3 text-sm text-slate-700">Nenhum chamado encontrado.</p>}

				<ul className="mt-4 space-y-3">
					{tickets.map((ticket, index) => {
						const isExpanded = expandedTicketId === ticket.id
						const visibleComments = (ticket.comments ?? []).filter(
							(c) => user.role !== 'CLIENT' || !c.isInternal
						)
						return (
							<li
								key={ticket.id}
								className="hover-lift enter-rise rounded-xl border border-white/50 bg-white/90"
								style={{ animationDelay: `${index * 70 + 280}ms` }}
							>
								<div className="p-4">
									<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
										<div>
											<p className="font-semibold text-slate-900">{ticket.title}</p>
											<p className="text-sm text-slate-700">{ticket.description}</p>
											{ticket.technician && (
												<p className="mt-1 text-xs text-slate-500">Técnico: {ticket.technician.name}</p>
											)}
										</div>
										<div className="flex items-center gap-2 text-xs">
											<span className="rounded-full bg-slate-100 px-2.5 py-1">Urgência: {priorityLabel[ticket.priority]}</span>
											<span className="rounded-full bg-cyan-100 px-2.5 py-1 text-cyan-900">{statusLabel[ticket.status]}</span>
										</div>
									</div>

									<div className="mt-3 flex flex-wrap items-center gap-2">
										{(user.role === 'TECHNICIAN' || user.role === 'ADMIN') && (
											<>
												<button
													onClick={() => void handleStatusChange(ticket.id, 'IN_PROGRESS')}
													disabled={isSaving}
													className="rounded bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900"
												>
													Em andamento
												</button>
												<button
													onClick={() => void handleStatusChange(ticket.id, 'RESOLVED')}
													disabled={isSaving}
													className="rounded bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900"
												>
													Resolver
												</button>
											</>
										)}

										{(user.role === 'ADMIN' || ticket.client.id === user.id) && (
											<button
												onClick={() => void handleDelete(ticket.id)}
												disabled={isSaving}
												className="rounded bg-rose-100 px-3 py-1 text-xs font-medium text-rose-900"
											>
												Excluir
											</button>
										)}

										<button
											onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
											className="ml-auto rounded bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
										>
											{isExpanded ? 'Fechar' : `Comentários (${visibleComments.length})`}
										</button>
									</div>
								</div>

								{isExpanded && (
									<div className="border-t border-slate-200/80 px-4 pb-4 pt-3 enter-rise">
										{visibleComments.length === 0 && (
											<p className="text-sm text-slate-500 mb-3">Nenhum comentário ainda.</p>
										)}
										<ul className="mb-3 space-y-2">
											{visibleComments.map((comment) => (
												<li
													key={comment.id}
													className={`rounded-lg px-3 py-2 text-sm ${comment.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-200'}`}
												>
													<div className="flex items-center gap-2 mb-1">
														<span className="font-medium text-slate-800">{comment.author.name}</span>
														{comment.isInternal && (
															<span className="text-xs rounded px-1.5 py-0.5 bg-amber-200 text-amber-900">Interno</span>
														)}
														<span className="ml-auto text-xs text-slate-400">
															{new Date(comment.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
														</span>
													</div>
													<p className="text-slate-700">{comment.content}</p>
												</li>
											))}
										</ul>
										<div className="flex flex-col gap-2">
											<textarea
												value={commentTexts[ticket.id] ?? ''}
												onChange={(e) => setCommentTexts((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
												placeholder="Escreva um comentário..."
												rows={2}
												className="rounded-lg border border-slate-300/90 bg-white/90 px-3 py-2 text-sm"
											/>
											<div className="flex items-center gap-3">
												{(user.role === 'ADMIN' || user.role === 'TECHNICIAN') && (
													<label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
														<input
															type="checkbox"
															checked={isInternalFlags[ticket.id] ?? false}
															onChange={(e) => setIsInternalFlags((prev) => ({ ...prev, [ticket.id]: e.target.checked }))}
															className="rounded"
														/>
														Comentário interno
													</label>
												)}
												<button
													onClick={() => void handlePostComment(ticket.id)}
													disabled={isPostingComment || !commentTexts[ticket.id]?.trim()}
													className="ml-auto rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-400 disabled:opacity-60"
												>
													{isPostingComment ? 'Enviando...' : 'Comentar'}
												</button>
											</div>
										</div>
									</div>
								)}
							</li>
						)
					})}
				</ul>
			</section>
		</div>
	)
}

