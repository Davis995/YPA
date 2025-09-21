import { m } from 'framer-motion';

export const Footer = () => {
	return (
		<footer className="mt-20 border-t border-slate-800 bg-slate-950/60">
			<div className="container-px mx-auto max-w-7xl py-10">
				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<h3 className="font-serif text-xl">Resultant</h3>
						<p className="mt-1 text-sm text-slate-300">Fine dining, warm service, and unforgettable flavors.</p>
					</div>
					<div>
						<h4 className="font-medium">Quick Links</h4>
						<ul className="mt-2 space-y-1 text-sm">
							{[
								{ href: '#menu', label: 'Menu' },
								{ href: '#reservation', label: 'Reservation' },
								{ href: '#branches', label: 'Branches' },
								{ href: '#contact', label: 'Contact' },
							].map((l) => (
								<li key={l.href}>
									<a className="hover:text-brand" href={l.href}>{l.label}</a>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h4 className="font-medium">Branches</h4>
						<ul className="mt-2 space-y-1 text-sm text-slate-300">
							<li>Rubaga Road </li>
						
						</ul>
					</div>
					<div>
						<h4 className="font-medium">Follow Us</h4>
						<div className="mt-2 flex gap-3">
							{['Tiktok', 'instagram', 'facebook'].map((s) => (
								<m.a key={s} href="#" whileHover={{ y: -2 }} className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-700 hover:bg-slate-800" aria-label={s}>
									<span className="capitalize">{s[0]}</span>
								</m.a>
							))}
						</div>
					</div>
				</div>
				<p className="mt-10 text-center text-xs text-slate-500">© {new Date().getFullYear()} Resultant. All rights reserved.</p>
			</div>
		</footer>
	);
};



