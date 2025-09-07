import { Section } from '../components/Section';
import { m } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Types
interface ContactFormData {
	name: string;
	email: string;
	phone: string;
	message: string;
}

interface ContactMessage extends ContactFormData {
	status: 'new' | 'handled';
}
const baseUrl = import.meta.env.VITE_API_URL
// API function
const submitContactMessage = async (data: ContactMessage): Promise<void> => {
	const response = await fetch(`${baseUrl}/api/contacts/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error('Failed to submit contact message');
	}
};

export const Contact = () => {
	const [sent, setSent] = useState(false);
	
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<ContactFormData>();

	const mutation = useMutation({
		mutationFn: submitContactMessage,
		onSuccess: () => {
			setSent(true);
			setTimeout(() => setSent(false), 3000);
			reset();
			
		},
		onError: (error) => {
			console.error('Error sending message:', error);
			
		},
	});

	const onSubmit = (data: ContactFormData) => {
		const contactMessage: ContactMessage = {
			...data,
			status: 'new',
		};
		mutation.mutate(contactMessage);
	};

	return (
		<Section id="contact" className="py-20">
			<div className="mb-8">
				<h2 className="font-serif text-3xl">Contact Us</h2>
				<p className="text-slate-300">We would love to hear from you.</p>
			</div>
			<div className="grid gap-8 md:grid-cols-2">
				<m.form
					initial={{ opacity: 0, x: -16 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6"
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<label className="grid gap-1">
							<span className="text-sm">Name</span>
							<m.input 
								whileFocus={{ scale: 1.01 }} 
								{...register('name', { required: 'Name is required' })}
								placeholder="Your name" 
								className={`rounded border ${errors.name ? 'border-red-500' : 'border-slate-300'} bg-white text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand`}
							/>
							{errors.name && <span className="text-xs text-red-400">{errors.name.message}</span>}
						</label>
						<label className="grid gap-1">
							<span className="text-sm">Email</span>
							<m.input 
								whileFocus={{ scale: 1.01 }} 
								type="email" 
								{...register('email', { 
									required: 'Email is required',
									pattern: {
										value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										message: 'Invalid email address'
									}
								})}
								placeholder="you@example.com" 
								className={`rounded border ${errors.email ? 'border-red-500' : 'border-slate-300'} bg-white text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand`}
							/>
							{errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
						</label>
						<label className="grid gap-1 sm:col-span-2">
							<span className="text-sm">Phone</span>
							<m.input 
								whileFocus={{ scale: 1.01 }} 
								{...register('phone', { required: 'Phone number is required' })}
								placeholder="(+256) 758830899" 
								className={`rounded border ${errors.phone ? 'border-red-500' : 'border-slate-300'} bg-white text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand`}
							/>
							{errors.phone && <span className="text-xs text-red-400">{errors.phone.message}</span>}
						</label>
						<label className="grid gap-1 sm:col-span-2">
							<span className="text-sm">Message</span>
							<m.textarea 
								whileFocus={{ scale: 1.01 }} 
								{...register('message', { required: 'Message is required' })}
								rows={4} 
								placeholder="How can we help?" 
								className={`rounded border ${errors.message ? 'border-red-500' : 'border-slate-300'} bg-white text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand`}
							/>
							{errors.message && <span className="text-xs text-red-400">{errors.message.message}</span>}
						</label>
					</div>
					<m.button 
						whileHover={{ scale: 1.02 }} 
						whileTap={{ scale: 0.98 }} 
						type="submit" 
						disabled={isSubmitting || mutation.isPending}
						className="rounded bg-brand px-5 py-2 font-medium text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting || mutation.isPending ? 'Sending...' : 'Send Message'}
					</m.button>
					<m.span 
						initial={{ opacity: 0, y: -6 }} 
						animate={sent ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }} 
						className="ml-3 text-sm text-brand-light"
					>
						Thanks! We will get back to you soon.
					</m.span>
				</m.form>

				<div>
					<h3 className="mb-2 font-medium">Connect</h3>
					<div className="flex gap-3">
						{['twitter', 'instagram', 'facebook'].map((s) => (
							<m.a
								key={s}
								href="#"
								whileHover={{ y: -2 }}
								className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 hover:bg-slate-800"
								aria-label={s}
							>
								<span className="capitalize">{s[0]}</span>
							</m.a>
						))}
					</div>
				</div>
			</div>
		</Section>
	);
};