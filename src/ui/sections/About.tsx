import { Section } from '../components/Section';
import { m } from 'framer-motion';
import img from "../components/asserts/Meat.png"
export const About = () => {
	return (
		<Section id="about" className="py-20">
			<div className="grid items-center gap-10 md:grid-cols-2">
				<m.div
					initial={{ opacity: 0, x: -24 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: '-100px' }}
					transition={{ duration: 0.6 }}
					className="order-2 md:order-1"
				>
					<h2 className="mb-4 font-serif text-3xl">About Us</h2>
					<p className="text-slate-300">
					At YPA Mubuzichoma, we serve authentic goat meat dishes made from fresh, locally sourced ingredients. Enjoy tender, flavorful meals in a cozy, welcoming atmosphere — where tradition meets taste.
					</p>
				</m.div>
				<m.div
					initial={{ opacity: 0, x: 24 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: '-100px' }}
					transition={{ duration: 0.6 }}
					className="order-1 md:order-2"
				>
					<div className="relative">
						<img
							src={img}
							alt="Restaurant interior"
							loading="lazy"
							className="h-72 w-full rounded-lg object-cover shadow-2xl shadow-black/30 md:h-96"
						/>
						<m.img
							src="https://static.vecteezy.com/system/resources/previews/033/692/644/large_2x/chef-preparing-food-in-the-kitchen-at-the-restaurant-professional-chef-cooking-gourmet-chef-cooking-in-a-commercial-kitchen-ai-generated-free-photo.jpg"
							alt="Chef cooking"
							
							loading="lazy"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.2 }}
							className="absolute -bottom-6 -right-6 hidden h-32 w-48 rounded-lg object-cover shadow-xl shadow-black/30 ring-1 ring-slate-700/60 sm:block"
						/>
					</div>
				</m.div>
			</div>
		</Section>
	);
};



