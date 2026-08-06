import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mb-6">
        <AlertCircle size={48} />
      </div>
      <h1 className="text-4xl font-black text-[var(--foreground)] mb-4">404 - Page Not Found</h1>
      <p className="text-[var(--muted-foreground)] max-w-md mb-8">
        The page you are looking for does not exist, has been removed, or you do not have permission to access it.
      </p>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity font-bold">
        <ArrowLeft size={20} /> Go Back
      </button>
    </div>
  );
}
