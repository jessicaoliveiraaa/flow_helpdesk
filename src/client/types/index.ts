export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'CLIENT'

export type User = {
	id: string
	name: string
	email: string
	role: UserRole
}

export type AuthResponse = {
	token: string
	user: User
}

export type Comment = {
	id: string
	content: string
	isInternal: boolean
	createdAt: string
	author: {
		id: string
		name: string
		role: UserRole
	}
}

export type Ticket = {
	id: string
	title: string
	description: string
	priority: 'LOW' | 'MEDIUM' | 'HIGH'
	status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
	createdAt: string
	client: {
		id: string
		name: string
		email: string
	}
	technician?: {
		id: string
		name: string
		email: string
	} | null
	comments?: Comment[]
}
