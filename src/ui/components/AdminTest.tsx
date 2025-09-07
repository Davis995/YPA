import React from 'react';
import { useLocation } from 'react-router-dom';

const AdminTest: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Admin Test Page
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This page confirms the admin routing is working
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Current Location:</h3>
            <p className="text-sm text-gray-600">{location.pathname}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Hash:</h3>
            <p className="text-sm text-gray-600">{location.hash}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Search:</h3>
            <p className="text-sm text-gray-600">{location.search}</p>
          </div>
        </div>
        
        <div className="text-center">
          <a 
            href="/#/admin/login" 
            className="text-indigo-600 hover:text-indigo-500"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminTest;






