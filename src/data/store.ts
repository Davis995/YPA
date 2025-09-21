const STORAGE_KEYS = {
	admin: 'restaurant.admin',
} as const;

const safeParse = <T>(raw: string | null, fallback: T): T => {
	try {
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
};

type AdminState = { 
  token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
};

export const loadAdmin = (): AdminState => safeParse(localStorage.getItem(STORAGE_KEYS.admin), {});
export const saveAdmin = (state: AdminState) => localStorage.setItem(STORAGE_KEYS.admin, JSON.stringify(state));
export const clearAdmin = () => localStorage.removeItem(STORAGE_KEYS.admin);


