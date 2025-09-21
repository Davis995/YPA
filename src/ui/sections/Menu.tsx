import { Section } from '../components/Section';
import { m } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '../../data/api';

interface Category {
	id: number;
	name: string;
	description: string;
	image: string;
	created_at: string;
	updated_at: string;
}

interface MenuItem {
	id: number;
	name: string;
	description: string;
	price: string;
	image: string;
	category: number;
	is_available: boolean;
	created_at: string;
	updated_at: string;
	categoryName: string;
}

const baseUrl = import.meta.env.VITE_API_URL
export const Menu = () => {
	const [activeCategory, setActiveCategory] = useState<string>('');
	
	// Fetch categories
	const { 
		data: categoriesData, 
		isLoading: categoriesLoading,
		error: categoriesError 
	} = useQuery({
		queryKey: ['categories'],
		queryFn: () => fetch(`${baseUrl}/api/categories/`).then(res => res.json()),
		refetchInterval:3000
		// staleTime: 10 * 60 * 1000, // 10 minutes
		// cacheTime: 15 * 60 * 1000, // 15 minutes
	});

	// Fetch menu items
	const { 
		data: menuData, 
		isLoading: menuLoading,
		error: menuError,
		refetch: refetchMenu,
		isRefetching 
	} = useQuery({
		queryKey: ['menu'],
		queryFn: () => fetch(`${baseUrl}/api/menu/`).then(res => res.json()),
		refetchInterval:5000,
		staleTime: 5 * 60 * 1000, // 5 minutes
		// cacheTime: 10 * 60 * 1000, // 10 minutes
		refetchOnWindowFocus: false,
		retry: 3,
	});
console.log(menuData)
	const categories: Category[] = categoriesData || [];
	const menuItems: MenuItem[] = menuData || [];

	// Set first available category as default
	useEffect(() => {
		if (categories.length > 0 && !activeCategory) {
			setActiveCategory(categories[0].name);
		}
	}, [categories, activeCategory]);

	// Filter menu items by active category
	const filteredItems = useMemo(() => {
		if (!activeCategory) return [];
		return menuItems.filter((item: MenuItem) => item.categoryName === activeCategory);
	}, [activeCategory, menuItems]);

	// Get active category details
	const activeCategoryDetails = useMemo(() => {
		return categories.find(cat => cat.name === activeCategory);
	}, [categories, activeCategory]);

	// Handle manual refresh
	const handleRefresh = () => {
		refetchMenu();
	};

	// Loading state
	if (categoriesLoading || menuLoading) {
		return (
			<Section id="menu" className="py-20">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-r-transparent"></div>
					<p className="mt-4 text-slate-300">Loading menu...</p>
				</div>
			</Section>
		);
	}

	// Error state
	if (categoriesError || menuError) {
		return (
			<Section id="menu" className="py-20">
				<div className="text-center">
					<p className="text-red-400">Failed to load menu</p>
					<button 
						onClick={handleRefresh}
						className="mt-4 rounded-full border border-brand bg-brand/10 px-6 py-2 text-brand transition-colors hover:bg-brand/20"
					>
						Try Again
					</button>
				</div>
			</Section>
		);
	}

	return (
		<Section id="menu" className="py-20">
			<div className="mb-8 flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<h2 className="font-serif text-3xl">Our Menu</h2>
					<button
						onClick={handleRefresh}
						disabled={isRefetching}
						className="text-slate-400 transition-colors hover:text-brand disabled:opacity-50"
						title="Refresh menu"
					>
						<svg 
							className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} 
							fill="none" 
							stroke="currentColor" 
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
					</button>
				</div>
				
				<div className="flex flex-wrap gap-2">
					{categories.map((category) => {
						
						return (
							<m.button
								key={category.id}
								whileTap={{ scale: 0.98 }}
								onClick={() => setActiveCategory(category.name)}
								className={`rounded-full border px-4 py-2 text-sm transition-colors ${
									activeCategory === category.name 
										? 'border-brand bg-brand/10 text-brand' 
										: 'border-slate-700 hover:bg-slate-800/50'
								}`}
							>
								{category.name}
							</m.button>
						);
					})}
				</div>
			</div>

			{/* Category description */}
			{/* {activeCategoryDetails && (
				<div className="mb-6 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
					<div className="flex items-center gap-4">
						{activeCategoryDetails.image && (
							<img 
								src={`http://127.0.0.1:8000${activeCategoryDetails.image}`}
								alt={activeCategoryDetails.name}
								className="h-16 w-16 rounded-lg object-cover"
								onError={(e) => {
									e.currentTarget.style.display = 'none';
								}}
							/>
						)}
						<div>
							<h3 className="text-lg font-semibold text-brand">{activeCategoryDetails.name}</h3>
							<p className="text-slate-300">{activeCategoryDetails.description}</p>
						</div>
					</div>
				</div>
			)} */}

			{filteredItems.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-slate-400">No items found in this category</p>
				</div>
			) : (
				<m.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{filteredItems.map((item: MenuItem) => (
						<m.article
							layout
							key={item.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							whileHover={{ y: -4 }}
							className={`group overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-black/20 ${
								!item.is_available ? 'opacity-60' : ''
							}`}
						>
							<div className="relative h-44 overflow-hidden">
								<m.img
									src={
										item.image 
											? `${baseUrl}${item.image}` 
											: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjAwSDEyMFYxNjBIMjgwVjIwMEgyMDBaTTIwMCAxNDBDMTgzLjU4IDE0MCAxNjcuOTY1IDEzMy43ODYgMTU2Ljc4NyAxMjIuMjEzQzE0NS42MDggMTEwLjY0IDEzOS4zNzUgOTQuOTEzIDEzOS4zNzUgNzguNzVDMTM5LjM3NSA2Mi41ODcgMTQ1LjYwOCA0Ni44NiAxNTYuNzg3IDM1LjI4N0MxNjcuOTY1IDIzLjcxNCAxODMuNTggMTcuNSAyMDAgMTcuNUMyMTYuNDIgMTcuNSAyMzIuMDM1IDIzLjcxNCAyNDMuMjEzIDM1LjI4N0MyNTQuMzkyIDQ2Ljg2IDI2MC42MjUgNjIuNTg3IDI2MC42MjUgNzguNzVDMjYwLjYyNSA5NC45MTMgMjU0LjM5MiAxMTAuNjQgMjQzLjIxMyAxMjIuMjEzQzIzMi4wMzUgMTMzLjc4NiAyMTYuNDIgMTQwIDIwMCAxNDBaTTIwMCAxMjBDMjEwLjQ2IDEyMCAyMjAuNTU2IDExNS4yNjggMjI3Ljk4IDEwNy4yNjZDMjM1LjQwNCA5OS4yNjUgMjQwIDg4LjkxMyAyNDAgNzguNzVDMjQwIDY4LjU4NyAyMzUuNDA0IDU4LjIzNSAyMjcuOTggNTAuMjM0QzIyMC41NTYgNDIuMjMyIDIxMC40NiAzNy41IDIwMCAzNy41QzE4OS41NCAzNy41IDE3OS40NDQgNDIuMjMyIDE3Mi4wMiA1MC4yMzRDMTY0LjU5NiA1OC4yMzUgMTYwIDY4LjU4NyAxNjAgNzguNzVDMTYwIDg4LjkxMyAxNjQuNTk2IDk5LjI2NSAxNzIuMDIgMTA3LjI2NkMxNzkuNDQ0IDExNS4yNjggMTg5LjU0IDEyMCAyMDAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'
									}
									alt={item.name}
									loading="lazy"
									className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									onError={(e) => {
										e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjAwSDEyMFYxNjBIMjgwVjIwMEgyMDBaTTIwMCAxNDBDMTgzLjU4IDE0MCAxNjcuOTY1IDEzMy43ODYgMTU2Ljc4NyAxMjIuMjEzQzE0NS42MDggMTEwLjY0IDEzOS4zNzUgOTQuOTEzIDEzOS4zNzUgNzguNzVDMTM5LjM3NSA2Mi41ODcgMTQ1LjYwOCA0Ni44NiAxNTYuNzg3IDM1LjI4N0MxNjcuOTY1IDIzLjcxNCAxODMuNTggMTcuNSAyMDAgMTcuNUMyMTYuNDIgMTcuNSAyMzIuMDM1IDIzLjcxNCAyNDMuMjEzIDM1LjI4N0MyNTQuMzkyIDQ2Ljg2IDI2MC42MjUgNjIuNTg3IDI2MC42MjUgNzguNzVDMjYwLjYyNSA5NC45MTMgMjU0LjM5MiAxMTAuNjQgMjQzLjIxMyAxMjIuMjEzQzIzMi4wMzUgMTMzLjc4NiAyMTYuNDIgMTQwIDIwMCAxNDBaTTIwMCAxMjBDMjEwLjQ2IDEyMCAyMjAuNTU2IDExNS4yNjggMjI3Ljk4IDEwNy4yNjZDMjM1LjQwNCA5OS4yNjUgMjQwIDg4LjkxMyAyNDAgNzguNzVDMjQwIDY4LjU4NyAyMzUuNDA0IDU4LjIzNSAyMjcuOTggNTAuMjM0QzIyMC41NTYgNDIuMjMyIDIxMC40NiAzNy41IDIwMCAzNy41QzE4OS41NCAzNy41IDE3OS40NDQgNDIuMjMyIDE3Mi4wMiA1MC4yMzRDMTY0LjU5NiA1OC4yMzUgMTYwIDY4LjU4NyAxNjAgNzguNzVDMTYwIDg4LjkxMyAxNjQuNTk2IDk5LjI2NSAxNzIuMDIgMTA3LjI2NkMxNzkuNDQ0IDExNS4yNjggMTg5LjU0IDEyMCAyMDAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'
									}}
								/>
								<m.div 
									initial={{ opacity: 0 }} 
									whileHover={{ opacity: 1 }} 
									className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" 
								/>
								
								{/* Availability indicator */}
								<div className="absolute top-2 right-2">
									<span className={`rounded-full px-2 py-1 text-xs font-medium ${
										item.is_available 
											? 'bg-green-500/20 text-green-400 border border-green-500/30' 
											: 'bg-red-500/20 text-red-400 border border-red-500/30'
									}`}>
										{item.is_available ? 'Available' : 'Unavailable'}
									</span>
								</div>
							</div>
							
							<div className="space-y-1 p-4">
								<div className="flex items-center justify-between">
									<h3 className="font-medium">{item.name}</h3>
									<span className="text-brand font-semibold">
										UGX {parseFloat(item.price).toLocaleString()}
									</span>
								</div>
								<p className="text-sm text-slate-300 line-clamp-2">
									{item.description || 'No description available'}
								</p>
								
								{/* Category badge */}
								<div className="pt-2">
									<span className="inline-block rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
										{item.categoryName}
									</span>
								</div>
							</div>

							{/* Disabled overlay for unavailable items */}
							{!item.is_available && (
								<div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
									<span className="bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
										Currently Unavailable
									</span>
								</div>
							)}
						</m.article>
					))}
				</m.div>
			)}
		</Section>
	);
};