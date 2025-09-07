# Restaurant Management System

A full-stack restaurant management system with a React frontend and Django backend.

## Features

### Admin Panel
- Dashboard with statistics
- Menu management with image uploads
- Category management with image uploads
- Booking management
- Order management
- Contact message handling
- User management

### Customer Website
- Responsive design
- Menu display with categories
- Contact form
- Reservation booking
- Order placement

## Image Upload Functionality

The system supports image uploads for both categories and menu items:

### Backend (Django)
- Images are stored in the `media/` directory
- Category images: `media/categories/`
- Menu item images: `media/menu/`
- Uses Django's `ImageField` with proper file handling
- Supports `multipart/form-data` for file uploads

### Frontend (React)
- File input components for image selection
- FormData handling for file uploads
- Proper image display with fallback for missing images
- Image preview in edit forms
- Automatic image URL construction for server-stored images

### Image Display
- Images are served from `http://localhost:8000/media/`
- Fallback to placeholder images when images are missing
- Responsive image display with proper aspect ratios

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd restaurant-website
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Admin Panel Access

### Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

### Access Admin Panel
1. Navigate to `/admin` in your browser
2. You'll be redirected to the login page
3. Enter the credentials above
4. Access the full admin panel

## Admin Panel Features

### Dashboard
- Overview statistics (categories, menu items, bookings, orders, messages, revenue)
- Recent bookings and orders
- Quick status updates

### Categories Management
- Create, edit, and delete menu categories
- Upload category images
- Manage category descriptions

### Menu Management
- Add, edit, and delete menu items
- Set prices and descriptions
- Assign categories
- Upload item images

### Bookings Management
- View all reservations
- Filter by status (new, confirmed, cancelled)
- Update booking status
- Delete bookings

### Orders Management
- Track order status (pending, confirmed, preparing, ready, delivered, cancelled)
- View order details and items
- Update order status
- Revenue tracking

### Messages Management
- Handle customer contact messages
- Mark messages as handled
- Filter by status
- View message details

### Users Management
- Manage admin users
- Assign roles (admin, manager)
- Create and edit user accounts

## API Simulation

The admin panel uses simulated API calls with `fetch` to demonstrate real-world API integration:

- All CRUD operations are simulated
- Data is stored in localStorage
- API responses include success/error messages
- Loading states and error handling

## Data Persistence

- All data is stored in browser localStorage
- Sample data is automatically initialized on first load
- Data persists between sessions

## Project Structure

```
src/
├── data/
│   ├── api.ts          # API service functions
│   ├── store.ts        # Data storage and utilities
│   └── types.ts        # TypeScript type definitions
├── ui/
│   ├── components/     # Admin panel components
│   ├── sections/       # Main website sections
│   └── App.tsx         # Main app component
└── main.tsx           # App entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Customization

### Adding New Features
1. Define types in `src/data/types.ts`
2. Add API functions in `src/data/api.ts`
3. Create components in `src/ui/components/`
4. Add routes in `src/ui/App.tsx`

### Styling
- Uses Tailwind CSS for styling
- Custom styles can be added in `src/index.css`
- Component-specific styles use Tailwind classes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For support or questions, please open an issue in the repository.


