import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, ArrowDownToLine, Package, Warehouse, LogOut, Users, UserSquare2, Truck } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Point of Sale', path: '/orders', icon: ShoppingCart },
    { name: 'Procurement', path: '/purchases', icon: Truck },
    { name: 'Receive Stock', path: '/inventory', icon: ArrowDownToLine },
    { name: 'Catalog', path: '/products', icon: Package },
    { name: 'Warehouses', path: '/warehouses', icon: Warehouse },
    { name: 'Suppliers', path: '/suppliers', icon: Users },
    { name: 'Customers', path: '/customers', icon: UserSquare2 },
  ];

  return (
    <div className="glass-panel" style={{ 
      width: '260px', 
      margin: '20px', 
      padding: '32px 24px', 
      display: 'flex', 
      flexDirection: 'column', 
      borderRadius: '24px',
      position: 'sticky',
      top: '20px',
      height: 'calc(100vh - 40px)',
      boxSizing: 'border-box'
    }}>
      <div style={{ fontWeight: '800', fontSize: '24px', color: 'var(--text-color)', marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '8px', backgroundColor: 'var(--primary)', borderRadius: '12px', color: 'var(--text-color)', display: 'flex' }}>
          <Package size={24} />
        </div>
        StockPilot
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {navItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: isActive ? 'var(--text-color)' : 'var(--secondary)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.5)' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.2s ease',
                border: isActive ? '1px solid rgba(255,255,255,0.6)' : '1px solid transparent',
              }}
            >
              <item.icon size={20} color={isActive ? 'var(--text-color)' : 'var(--secondary)'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <button 
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 16px',
          borderRadius: '12px',
          border: 'none',
          background: 'transparent',
          color: 'var(--secondary)',
          fontWeight: '500',
          cursor: 'pointer',
          textAlign: 'left',
          marginTop: 'auto',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.color = '#c62828'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--secondary)'}
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
