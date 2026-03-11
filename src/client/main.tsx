import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/auth-context'
import { ToastProvider } from './contexts/toast-context'
import './styles/global.css'

createRoot(document.getElementById('root') as HTMLElement).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<ToastProvider>
					<App />
				</ToastProvider>
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>
)
