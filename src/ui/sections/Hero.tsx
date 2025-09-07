import { m, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Typewriter } from '../components/Typewriter';
import { HashLink } from "react-router-hash-link";
export const Hero = () => {
	const ref = useRef<HTMLDivElement | null>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
	const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
	const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);

	return (
		<section id="hero" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
			<m.div
				ref={ref}
				style={{ y, opacity }}
				className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center"
			>
				<div className="absolute inset-0 bg-hero-pattern"></div>
			</m.div>

			<div className="container-px mx-auto max-w-5xl text-center">
				<m.h1
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="mb-4 font-serif text-4xl sm:text-5xl md:text-6xl"
				>
					Authentic Goat, Timeless Taste
				</m.h1>
				<m.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2, duration: 0.8 }}
					className="mx-auto mb-8 max-w-2xl text-slate-200"
				>
					<Typewriter
  words={[
    "Delicious goat dishes.",
    "Fresh farm-to-table goat meat.",
    "Tender, slow-cooked flavors.",
    "A true taste of tradition.",
    "Goat meat, done right.",
"From Farm to Feast",

"Fresh Goat, Fresh Flavor",

"Nature’s Best, Served to You",

"Pure Taste, Pure Tradition"


  ]}
/>
				</m.p>

				<div className="flex justify-center gap-3">
				<m.div 		whileHover={{ scale: 1.04 }}
						whileTap={{ scale: 0.98 }}
						className="rounded-full border border-slate-700  bg-brand px-6 py-3 font-medium transition-colors hover:bg-slate-800"
					>
						<HashLink 
					smooth to="#menu">
						
				
					Expore Menu
					</HashLink>
				</m.div>


					
				<m.div 		whileHover={{ scale: 1.04 }}
						whileTap={{ scale: 0.98 }}
						className="rounded-full border border-slate-700 bg-slate-900/60 px-6 py-3 font-medium transition-colors hover:bg-slate-800"
					>
						<HashLink 
					smooth to="#reservation">
						
				
						Book a Table
					</HashLink>
				</m.div>
				</div>
			</div>
		</section>
	);
};


