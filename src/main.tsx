import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './ui/App';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Clear any existing localStorage data to start fresh
const clearOldData = () => {
  const keysToRemove = [
    'restaurant.menu',
    'restaurant.contacts', 
    'restaurant.bookings',
    'restaurant.categories',
    'restaurant.orders',
    'restaurant.adminUsers'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
  });
};

// Clear old data on app start
clearOldData();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter future={{ v7_relativeSplatPath: true }}>
        <App />
      </HashRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>
);



