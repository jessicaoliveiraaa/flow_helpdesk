import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
	id: number
	message: string
	type: ToastType
}

type ToastContextValue = {
	toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([])

	const toast = useCallback((message: string, type: ToastType = 'info') => {
		const id = nextId++
		setToasts((prev) => [...prev, { id, message, type }])
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id))
		}, 3800)
	}, [])

	return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			<div className="toast-container" aria-live="polite" aria-atomic="false">
				{toasts.map((t) => (
					<div key={t.id} className={`toast toast--${t.type}`} role="alert">
						<span className="toast__icon">
							{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'i'}
						</span>
						<span className="toast__message">{t.message}</span>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	)
}

export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext)
	if (!ctx) throw new Error('useToast must be used inside ToastProvider')
	return ctx
}
