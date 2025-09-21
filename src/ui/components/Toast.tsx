import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = { id: string; title: string; type?: 'success' | 'error' | 'info' };

type ToastContextValue = {
	push: (toast: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
	const [toasts, setToasts] = useState<Array<Toast>>([]);

	const push = useCallback((toast: Omit<Toast, 'id'>) => {
		const id = generateId();
		setToasts((prev) => [...prev, { ...toast, id }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 2800);
	}, []);

	const value = useMemo(() => ({ push }), [push]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div className="pointer-events-none fixed inset-x-0 top-3 z-[100] mx-auto flex max-w-xl flex-col gap-2 px-3">
				{toasts.map((t) => (
					<div
						key={t.id}
						className={`pointer-events-auto rounded border px-3 py-2 shadow-sm ${
							t.type === 'success'
								? 'border-green-200 bg-green-50 text-green-800'
							: t.type === 'error'
								? 'border-red-200 bg-red-50 text-red-800'
							: 'border-slate-200 bg-white text-slate-900'
						}`}
					>
						<span className="text-sm">{t.title}</span>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error('useToast must be used within ToastProvider');
	return ctx;
};


