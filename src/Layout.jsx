import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  if (isAuthPage) {
    return (
      <>
        <Toaster position="top-right" />
        <Outlet />
      </>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgba(232, 232, 240, 0.9)',
          backdropFilter: 'blur(10px)',
          color: 'var(--text-color)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          fontWeight: '500',
        },
        error: {
          style: {
            borderLeft: '4px solid #c62828',
          }
        },
        success: {
          style: {
            borderLeft: '4px solid #2e7d32',
          }
        }
      }} />
      <Sidebar />
      <div style={{ flex: 1, padding: '40px 40px 40px 20px', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
