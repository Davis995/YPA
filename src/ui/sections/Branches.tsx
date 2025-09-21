import { Section } from '../components/Section';
import { m } from 'framer-motion';

type Branch = {
	name: string;
	address: string;
	phone: string;
	hours: string;
	mapQuery: string;
};

const BRANCHES: Branch[] = [
	{ name: 'Rubaga Road', address: 'Opposite winners chapel International', phone: '(256) 758042624', hours: 'Mon-Sun 11:00 - 22:00', mapQuery: 'Youth Platform Africa' },
	];

export const Branches = () => {
const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
  BRANCHES[0].mapQuery
)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;	return (
		<Section id="branches" className="py-20">
			<div className="mb-8 flex items-end justify-between gap-4">
				<h2 className="font-serif text-3xl">Our Branches</h2>
				<p className="max-w-xl text-sm text-slate-300">Find us across the city. Each location offers the same care, menu staples, and signature hospitality.</p>
			</div>
			<div className="grid gap-6 lg:grid-cols-3">
				<m.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="aspect-video overflow-hidden rounded-xl border border-slate-800"
				>
					<iframe
						title="Map"
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						src={mapSrc}
						className="h-full w-full"
						style={{ border: 0 }}
					></iframe>
				</m.div>
				<div className="space-y-4 lg:col-span-2">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{BRANCHES.map((b, idx) => (
							<m.div
								key={b.name}
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: '-100px' }}
								transition={{ delay: idx * 0.05 }}
								className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow"
							>
								<h3 className="font-medium">{b.name}</h3>
								<p className="text-sm text-slate-300">{b.address}</p>
								<p className="text-sm text-slate-300">{b.phone}</p>
								<p className="text-xs text-slate-400">{b.hours}</p>
							</m.div>
						))}
					</div>
				</div>
			</div>
		</Section>
	);
};


