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
	category: MenuCategory;
	category_display: string;
	is_available: boolean;
	created_at: string;
	updated_at: string;
};

export type ContactMessage = {
	id: any;
	name: string;
	email: string;
	phone: string;
	message: string;
	created_at: any;
	updated_at: any;
	status: 'new' | 'handled';
	status_display: string;
};

export type Booking = {
	id: number;
	name: string;
	email: string;
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


