import { Link, useNavigate } from 'react-router-dom';
import { Package, TrendingUp, ShieldCheck, ArrowRight, LayoutDashboard, Search, Zap, ShoppingCart } from 'lucide-react';
import { useEffect, useRef } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Autoplay was prevented:", error);
      });
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', color: '#1a1a1a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* NAVIGATION BAR */}
      <nav style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800', fontSize: '24px', letterSpacing: '-0.5px' }}>
          <div style={{ padding: '8px', backgroundColor: 'var(--primary)', borderRadius: '12px', color: 'var(--text-color)', display: 'flex' }}>
            <Package size={24} />
          </div>
          StockPilot
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/login" style={{ textDecoration: 'none', color: '#1a1a1a', fontWeight: '500', padding: '8px 16px' }}>Sign In</Link>
          <button 
            style={{ borderRadius: '24px', padding: '12px 24px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => navigate('/register')}
          >
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ padding: '120px 24px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', borderRadius: '20px', fontWeight: '600', fontSize: '14px', marginBottom: '24px' }}>
          <Zap size={16} /> Now with Real-time Point of Sale
        </div>
        <h1 style={{ fontSize: '72px', fontWeight: '800', letterSpacing: '-2px', lineHeight: '1.1', margin: '0 0 24px 0' }}>
          Inventory management that actually <span style={{ color: 'var(--text-color)', textDecoration: 'underline decoration-var(--primary) 4px' }}>works for you.</span>
        </h1>
        <p style={{ fontSize: '22px', color: '#666', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px auto', lineHeight: '1.5' }}>
          StockPilot is the modern, lightning-fast OS for retail and wholesale. Track stock across warehouses, process sales, and manage suppliers in one beautiful workspace.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '64px' }}>
          <button 
            style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '30px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', border: 'none', cursor: 'pointer', fontWeight: '600' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => navigate('/register')}
          >
            Start your free trial
          </button>
          <button 
            style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '30px', backgroundColor: 'white', color: '#1a1a1a', border: '1px solid #ddd', cursor: 'pointer', fontWeight: '600' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </div>

        {/* VIDEO DEMO */}
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <div style={{ height: '32px', backgroundColor: '#f1f1f1', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
          </div>
          <video 
            ref={videoRef}
            src="https://github.com/user-attachments/assets/e2711617-8bc3-46bb-9565-d8f89addecb9" 
            autoPlay={true}
            loop={true}
            muted={true}
            playsInline={true}
            preload="auto"
            style={{ width: '100%', display: 'block', backgroundColor: '#f9fafb' }}
          ></video>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section style={{ padding: '80px 24px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1px', margin: '0 0 16px 0' }}>Everything you need to scale</h2>
            <p style={{ fontSize: '20px', color: '#666', margin: 0 }}>Stop fighting with spreadsheets. Start growing your business.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            
            {/* Feature 1 */}
            <div style={{ padding: '40px', backgroundColor: '#fafafa', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <ShoppingCart size={24} />
              </div>
              <h3 style={{ fontSize: '24px', margin: '0 0 12px 0' }}>Frictionless POS</h3>
              <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>Process sales instantly with our beautiful checkout terminal. Live stock deduction prevents overselling.</p>
            </div>

            {/* Feature 2 */}
            <div style={{ padding: '40px', backgroundColor: '#fafafa', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '24px', margin: '0 0 12px 0' }}>Real-time Analytics</h3>
              <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>Understand your cash flow. Interactive charts and KPIs give you absolute clarity on your revenue and orders.</p>
            </div>

            {/* Feature 3 */}
            <div style={{ padding: '40px', backgroundColor: '#fafafa', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '24px', margin: '0 0 12px 0' }}>Multi-Warehouse</h3>
              <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>Manage infinite physical locations. Keep track of exactly what is stored where, down to the exact SKU.</p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 48px', backgroundColor: '#111', color: '#fff', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontWeight: '800', fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '24px' }}>
          <div style={{ padding: '8px', backgroundColor: 'var(--primary)', borderRadius: '12px', color: 'var(--text-color)', display: 'flex' }}>
            <Package size={24} />
          </div>
          StockPilot
        </div>
        <p style={{ color: '#888', margin: 0 }}>© {new Date().getFullYear()} StockPilot Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
