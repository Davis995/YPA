export type MenuCategory = 'Goat' | 'Meals' | 'Drinks' | 'Desserts' | "Tea";

export type Category = {
	id: number;
	name: string;
	description: string;
	image: string | null;
	created_at: string;
	updated_at: string;
};

export type MenuItem = {
	id: number;
	name: string;
	description: string;
	price: string;
	image: string | null;
	category: string;
	category_display: string;
	is_available: boolean;
	created_at: string;
	updated_at: string;
};

export type ContactMessage = {
	id: number;
	name: string;
	email: string;
	phone: string;
	message: string;
	created_at: string;
	updated_at: string;
	status: 'new' | 'handled';
	status_display: string;
};

export type Booking = {
	id: number;
	name: string;
	email: string;
	phone: string;
	date: string;
	time: string;
	guests: number;
	created_at: string;
	updated_at: string;
	status: 'new' | 'confirmed' | 'cancelled';
	status_display: string;
	notes?: string;
};

export type Order = {
	id: number;
	customer_name: string;
	customer_email: string;
	customer_phone: string;
	items: OrderItem[];
	total: string;
	status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
	status_display: string;
	created_at: string;
	updated_at: string;
	notes?: string;
};

export type OrderItem = {
	id: number;
	menu_item: number;
	name: string;
	price: string;
	quantity: number;
};

export type AdminUser = {
	id: number;
	user: {
		id: number;
		username: string;
		email: string;
		first_name: string;
		last_name: string;
	};
	role: 'admin' | 'manager';
	role_display: string;
	phone: string;
	created_at: string;
	updated_at: string;
};

export type DashboardStats = {
	total_categories: number;
	total_menu_items: number;
	active_bookings: number;
	pending_orders: number;
	new_messages: number;
	total_revenue: string;
	recent_bookings: Booking[];
	recent_orders: Order[];
};

export type Table = {
	id: number;
	number: string;
};

export type OrderMenu = {
	id: number;
	status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
	total_price: number;
	table: string;
	items: OrderMenuItem[];
	payment_method: 'cash' | 'airtel_money' | 'mtn_momo';
	payment_method_display: string;
	created_at: string;
};

export type OrderMenuItem = {
	item: string;
	quantity: number;
	price: number;
	special_request?: string;
	subtotal: number;
};

export type WaiterRequest = {
	id: number;
	table_number: string;
	message: string;
	status: 'pending' | 'acknowledged' | 'completed';
	status_display: string;
	created_at: string;
	acknowledged_at?: string;
	completed_at?: string;
};

export interface Waiter {
	id: number;
	name: string;
	username: string;
	email: string;
	phone: string;
	role: 'waiter';
	role_display: string;
	status: 'available' | 'busy' | 'break' | 'offline';
	status_display: string;
	last_active: string;
	created_at: string;
};


