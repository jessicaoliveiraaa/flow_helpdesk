import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { prisma } from '../lib/prisma.js'
import type { AuthTokenPayload } from '../types/auth.js'

type SafeUser = {
	id: string
	name: string
	email: string
	role: 'ADMIN' | 'TECHNICIAN' | 'CLIENT'
}

function toSafeUser(user: {
	id: string
	name: string
	email: string
	role: string
}): SafeUser {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role as SafeUser['role']
	}
}

export async function loginWithEmailAndPassword(email: string, password: string) {
	const user = await prisma.user.findUnique({
		where: { email }
	})

	if (!user) {
		throw new Error('Credenciais inválidas')
	}

	const passwordMatches = await bcrypt.compare(password, user.password)

	if (!passwordMatches) {
		throw new Error('Credenciais inválidas')
	}

	const payload: AuthTokenPayload = {
		sub: user.id,
		role: user.role as AuthTokenPayload['role'],
		email: user.email
	}

	const token = jwt.sign(payload, env.JWT_SECRET, {
		expiresIn: '1d'
	})

	return {
		token,
		user: toSafeUser(user)
	}
}

export async function getProfile(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			role: true
		}
	})

	if (!user) {
		return null
	}

	return toSafeUser(user)
}
