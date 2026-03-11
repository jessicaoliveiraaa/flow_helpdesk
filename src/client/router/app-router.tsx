import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/app-layout'
import { DashboardPage } from '../pages/dashboard-page'
import { UsersPage } from '../pages/users-page'
import type { User } from '../types'

type AppRouterProps = {
	user: User
	token: string
	onLogout: () => void
}

export function AppRouter({ user, token, onLogout }: AppRouterProps) {
	return (
		<AppLayout user={user} onLogout={onLogout}>
			<Routes>
				<Route path="/" element={<DashboardPage user={user} token={token} />} />
				<Route
					path="/usuarios"
					element={user.role === 'ADMIN' ? <UsersPage token={token} /> : <Navigate to="/" replace />}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</AppLayout>
	)
}
