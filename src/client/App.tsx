import { useAuth } from './hooks/use-auth'
import { LoginPage } from './pages/login-page'
import { AppRouter } from './router/app-router'

function App() {
	const { user, token, isLoading, login, logout } = useAuth()

	if (isLoading) {
		return <main className="loading-shell">Carregando...</main>
	}

	if (!user || !token) {
		return <LoginPage onLogin={login} />
	}

	return <AppRouter user={user} token={token} onLogout={logout} />
}

export default App
