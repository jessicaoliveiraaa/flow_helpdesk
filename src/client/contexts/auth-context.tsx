import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { getMe, login as loginRequest } from '../lib/api'
import type { User } from '../types'

type AuthContextData = {
	user: User | null
	token: string | null
	isLoading: boolean
	login: (email: string, password: string) => Promise<void>
	logout: () => void
}

type AuthProviderProps = {
	children: React.ReactNode
}

const STORAGE_TOKEN_KEY = 'flow_helpdesk_token'

export const AuthContext = createContext<AuthContextData | null>(null)

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null)
	const [token, setToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY)

		if (!savedToken) {
			setIsLoading(false)
			return
		}

		getMe(savedToken)
			.then((profile) => {
				setToken(savedToken)
				setUser(profile)
			})
			.catch(() => {
				localStorage.removeItem(STORAGE_TOKEN_KEY)
			})
			.finally(() => {
				setIsLoading(false)
			})
	}, [])

	const login = useCallback(async (email: string, password: string) => {
		const response = await loginRequest({ email, password })
		localStorage.setItem(STORAGE_TOKEN_KEY, response.token)
		setToken(response.token)
		setUser(response.user)
	}, [])

	const logout = useCallback(() => {
		localStorage.removeItem(STORAGE_TOKEN_KEY)
		setToken(null)
		setUser(null)
	}, [])

	const value = useMemo(
		() => ({ user, token, isLoading, login, logout }),
		[isLoading, login, logout, token, user]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
