import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Menu } from './sections/Menu';
import { Branches } from './sections/Branches';
import { Contact } from './sections/Contact';
import { Reservation } from './sections/Reservation';
import { Footer } from './sections/Footer';
import { ToastProvider } from './components/Toast';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './components/AdminDashboard';
import AdminCategories from './components/AdminCategories';
import AdminMenu from './components/AdminMenu';
import AdminBookings from './components/AdminBookings';
import AdminOrders from './components/AdminOrders';
import AdminMessages from './components/AdminMessages';
import AdminUsers from './components/AdminUsers';
import AdminLogin from './components/AdminLogin';
import AdminSettings from './components/AdminSettings';
import AdminTest from './components/AdminTest';
import AdminTableOrders from './components/AdminTableOrders';
import AdminWaiterRequests from './components/AdminWaiterRequests';
import CustomerOrdering from './components/CustomerOrdering';
import KitchenDisplay from './components/KitchenDisplay';
import OrderStatusTracker from './components/OrderStatusTracker';
import { loadAdmin } from '../data/store';
import { useEffect, useState } from 'react';
import RestaurantMenu from './components/orderperTable.tsx';
import QRCodeComponent from './components/Qrcode';

const MainWebsite = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-display">
      <Header />
      <main>
        <Hero />
        <About />
        <Menu />
        <Branches />
        <Reservation />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const adminState = loadAdmin();
    setIsAuthenticated(!!adminState.token);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <>{children}</>;
};

export const App = () => {
  return (
    <LazyMotion features={domAnimation} strict>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<MainWebsite />} />
          <Route path="/admin/test" element={<AdminTest />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/qr" element={<QRCodeComponent/>} />
          <Route path="/menu/:tableId" element={<RestaurantMenu/>} />
          <Route path="/menu-new/:tableId" element={<CustomerOrdering/>} />
          <Route path="/order-status/:tableId/:orderId" element={<OrderStatusTracker/>} />
          <Route path="/kitchen" element={<KitchenDisplay/>} />
          <Route 
            path="/admin" 
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
          
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="table-orders" element={<AdminTableOrders />} />
            <Route path="waiter-requests" element={<AdminWaiterRequests />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </LazyMotion>
  );
};



