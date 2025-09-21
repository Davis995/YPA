import { m, useInView } from 'framer-motion';
import { useRef } from 'react';

type SectionProps = {
	id: string;
	children: React.ReactNode;
	className?: string;
};

export const Section = ({ id, children, className }: SectionProps) => {
	const ref = useRef<HTMLDivElement | null>(null);
	const inView = useInView(ref, { once: true, margin: '-100px' });

	return (
		<section id={id} className={className}>
			<m.div
				ref={ref}
				initial={{ opacity: 0, y: 24 }}
				animate={inView ? { opacity: 1, y: 0 } : {}}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				className="container-px mx-auto max-w-7xl"
			>
				{children}
			</m.div>
		</section>
	);
};



