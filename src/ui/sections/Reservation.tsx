import { Section } from '../components/Section';
import { m, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Types
interface ReservationFields {
	name: string;
	email: string;
	phone?: string;
	date: string;
	time: string;
	guests: number;
	notes?: string;
}

interface BookingData extends ReservationFields {
	status: 'new' | 'confirmed' | 'cancelled';
}

// API function
const baseUrl = import.meta.env.VITE_API_URL
const submitBooking = async (data: BookingData): Promise<void> => {
	const response = await fetch(`${baseUrl}/api/bookings/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.error || 'Failed to submit booking');
	}
};

export const Reservation = () => {
	const [open, setOpen] = useState(false);
	
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting }
	} = useForm<ReservationFields>({
		defaultValues: {
			name: '',
			email: '',
			phone: '',
			date: '',
			time: '',
			guests: 1,
			notes: ''
		}
	});

	const mutation = useMutation({
		mutationFn: submitBooking,
		onSuccess: () => {
			setOpen(false);
			reset();
			toast.success('Reservation submitted successfully!');
		},
		onError: (error: Error) => {
			console.error('Error submitting reservation:', error);
			toast.error(error.message || 'Failed to submit reservation. Please try again.');
		},
	});

	const onSubmit = (formData: ReservationFields) => {
		const bookingData: BookingData = {
			...formData,
			guests: Number(formData.guests || 1),
			status: 'new',
		};
		mutation.mutate(bookingData);
	};

	return (
		<Section id="reservation" className="py-20">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="font-serif text-3xl">Reservations</h2>
				<m.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => setOpen((v) => !v)}
					className="rounded bg-brand px-5 py-2 font-medium text-slate-950"
				>
					{open ? 'Close' : 'Book a table'}
				</m.button>
			</div>
			<AnimatePresence initial={false}>
				{open && (
					<m.form
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.4 }}
						className="overflow-hidden rounded-xl border border-slate-200 p-6 shadow"
						onSubmit={handleSubmit(onSubmit)}
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<label className="grid gap-1">
								<span className="text-sm">Name</span>
								<m.input 
									whileFocus={{ scale: 1.01 }} 
									{...register('name', { 
										required: 'Name is required',
										minLength: { value: 2, message: 'Name must be at least 2 characters' }
									})} 
									className={`rounded bg-white border ${errors.name ? 'border-red-500' : 'border-slate-300'} text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand`}
									placeholder="Your full name"
								/>
								{errors.name && <span className="text-xs text-red-600">{errors.name.message}</span>}
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
									className={`rounded bg-white border ${errors.email ? 'border-red-500' : 'border-slate-300'} text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand`}
									placeholder="you@example.com"
								/>
								{errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
							</label>
							<label className="grid gap-1">
								<span className="text-sm">Phone (Optional)</span>
								<m.input 
									whileFocus={{ scale: 1.01 }} 
									type="tel" 
									{...register('phone')} 
									className="rounded bg-white border border-slate-300 text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
									placeholder="(+256) 758830899"
								/>
							</label>
							<label className="grid gap-1">
								<span className="text-sm">Date</span>
								<m.input 
									whileFocus={{ scale: 1.01 }} 
									type="date" 
									{...register('date', { 
										required: 'Date is required',
										validate: (value) => {
											const selectedDate = new Date(value);
											const today = new Date();
											today.setHours(0, 0, 0, 0);
											return selectedDate >= today || 'Date cannot be in the past';
										}
									})} 
									className={`rounded bg-white border ${errors.date ? 'border-red-500' : 'border-slate-300'} text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand`}
									min={new Date().toISOString().split('T')[0]}
								/>
								{errors.date && <span className="text-xs text-red-600">{errors.date.message}</span>}
							</label>
							<label className="grid gap-1">
								<span className="text-sm">Time</span>
								<m.input 
									whileFocus={{ scale: 1.01 }} 
									type="time" 
									{...register('time', { 
										required: 'Time is required'
									})} 
									className={`rounded bg-white border ${errors.time ? 'border-red-500' : 'border-slate-300'} text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand`}
								/>
								{errors.time && <span className="text-xs text-red-600">{errors.time.message}</span>}
							</label>
							<label className="grid gap-1">
								<span className="text-sm">Guests</span>
								<m.input 
									whileFocus={{ scale: 1.01 }} 
									type="number" 
									min={1} 
									max={12} 
									{...register('guests', { 
										required: 'Number of guests is required',
										min: { value: 1, message: 'Minimum 1 guest' },
										max: { value: 12, message: 'Maximum 12 guests' },
										valueAsNumber: true
									})} 
									className={`rounded bg-white border ${errors.guests ? 'border-red-500' : 'border-slate-300'} text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand`}
								/>
								{errors.guests && <span className="text-xs text-red-600">{errors.guests.message}</span>}
							</label>
							<label className="grid gap-1 sm:col-span-2">
								<span className="text-sm">Special Notes (Optional)</span>
								<m.textarea 
									whileFocus={{ scale: 1.01 }} 
									{...register('notes')} 
									rows={3}
									className="rounded bg-white border border-slate-300 text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
									placeholder="Any special requests or dietary requirements..."
								/>
							</label>
						</div>
						<m.button 
							whileHover={{ scale: 1.02 }} 
							whileTap={{ scale: 0.98 }} 
							type="submit" 
							disabled={isSubmitting || mutation.isPending} 
							className="mt-4 rounded bg-brand px-5 py-2 font-medium text-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isSubmitting || mutation.isPending ? 'Submitting...' : 'Reserve'}
						</m.button>
					</m.form>
				)}
			</AnimatePresence>
		</Section>
	);
};