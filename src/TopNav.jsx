import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronLeft, LayoutDashboard } from 'lucide-react';

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the navigation bar on login and register pages
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
    return null;
  }

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '16px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(232, 232, 240, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Only show the Back button if we are NOT on the Dashboard */}
        {location.pathname !== '/dashboard' && (
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate(-1)}
            style={{ padding: '8px 16px', fontSize: '14px', height: '36px' }}
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}
        
        <Link to="/dashboard" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px', height: '36px', textDecoration: 'none' }}>
          <LayoutDashboard size={16} /> Dashboard
        </Link>
      </div>
      
      <div style={{ fontWeight: '600', color: 'var(--text-color)', opacity: 0.7 }}>
        StockPilot ✈️
      </div>
    </div>
  );
};

export default TopNav;
