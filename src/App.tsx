import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { MasterProvider } from './context/MasterContext';
import { AppRoutes } from './routes';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <MasterProvider>
        <AppProvider>
          <BrowserRouter>
            <Toaster position="top-center" />
            <AppRoutes />
          </BrowserRouter>
        </AppProvider>
      </MasterProvider>
    </AuthProvider>
  );
}
