import type { AuthResponse, Comment, Ticket, User } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

type RequestConfig = {
	method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
	token?: string | null
	body?: unknown
}

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
	const response = await fetch(`${API_URL}${path}`, {
		method: config.method ?? 'GET',
		headers: {
			'Content-Type': 'application/json',
			...(config.token ? { Authorization: `Bearer ${config.token}` } : {})
		},
		body: config.body ? JSON.stringify(config.body) : undefined
	})

	if (!response.ok) {
		const data = (await response.json().catch(() => null)) as { message?: string } | null
		throw new Error(data?.message ?? 'Erro ao comunicar com a API')
	}

	if (response.status === 204) {
		return undefined as T
	}

	return response.json() as Promise<T>
}

export function login(payload: { email: string; password: string }) {
	return request<AuthResponse>('/auth/login', {
		method: 'POST',
		body: payload
	})
}

export function getMe(token: string) {
	return request<User>('/auth/me', { token })
}

export function listTickets(
	token: string,
	filters?: { status?: string; priority?: string }
) {
	const params = new URLSearchParams()
	if (filters?.status) params.set('status', filters.status)
	if (filters?.priority) params.set('priority', filters.priority)
	const query = params.toString()
	return request<Ticket[]>(`/tickets${query ? `?${query}` : ''}`, { token })
}

export function createTicket(
	token: string,
	payload: { title: string; description: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' }
) {
	return request<Ticket>('/tickets', {
		method: 'POST',
		token,
		body: payload
	})
}

export function updateTicket(
	token: string,
	ticketId: string,
	payload: Partial<{
		title: string
		description: string
		priority: 'LOW' | 'MEDIUM' | 'HIGH'
		status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
		technicianId: string | null
	}>
) {
	return request<Ticket>(`/tickets/${ticketId}`, {
		method: 'PATCH',
		token,
		body: payload
	})
}

export function deleteTicket(token: string, ticketId: string) {
	return request<void>(`/tickets/${ticketId}`, {
		method: 'DELETE',
		token
	})
}

export function listUsers(token: string) {
	return request<User[]>('/users', { token })
}

export function createUser(
	token: string,
	payload: { name: string; email: string; password: string; role: 'ADMIN' | 'TECHNICIAN' | 'CLIENT' }
) {
	return request<User>('/users', { method: 'POST', token, body: payload })
}

export function createComment(
	token: string,
	ticketId: string,
	payload: { content: string; isInternal?: boolean }
) {
	return request<Comment>(`/tickets/${ticketId}/comments`, { method: 'POST', token, body: payload })
}
