import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useMasterAuth } from '../context/MasterContext';

export default function MasterRoute() {
  const { masterToken } = useMasterAuth();

  if (!masterToken) {
    return <Navigate to="/master" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}
