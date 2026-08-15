import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, ShoppingCart, AlertTriangle, LogOut, Package, Warehouse, ArrowDownToLine } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from './api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {

    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (err) {
        setError("Failed to load dashboard data.");
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading workspace...</div>;
  }
  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER SECTION (2-column layout) */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary)' }}>
            <LayoutDashboard color="var(--text-color)" />
          </div>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Overview</h1>
            <p style={{ color: 'var(--secondary)', margin: 0 }}>Track your business performance and critical inventory alerts.</p>
          </div>
        </div>
        
      </header>
      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* KPI Card 1 */}

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--secondary)' }}>
            <TrendingUp size={20} />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Total Revenue</span>
          </div>
          <h2 style={{ fontSize: '32px', margin: 0 }}>${data.kpis.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
        </div>

        {/* KPI Card 2 */}

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--secondary)' }}>
            <ShoppingCart size={20} />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Total Orders</span>
          </div>
          <h2 style={{ fontSize: '32px', margin: 0 }}>{data.kpis.total_orders}</h2>
        </div>

        {/* KPI Card 3 */}

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--secondary)' }}>
            <TrendingUp size={20} />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Average Order Value</span>
          </div>
          <h2 style={{ fontSize: '32px', margin: 0 }}>${data.kpis.average_order_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <section className="glass-panel" style={{ marginBottom: '40px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Revenue Overview (Last 30 Days)</h3>
        {data.chart_data && data.chart_data.length > 0 ? (
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart data={data.chart_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--secondary)" />
                <YAxis stroke="var(--secondary)" tickFormatter={(value) => `$${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
            No sales data available for the last 30 days. Process a sale to see your metrics!
          </div>
        )}
      </section>

      {/* LIST LAYOUT SECTION */}

      <section className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <AlertTriangle color="#c62828" />
          <h3 style={{ margin: 0 }}>Low Stock Alerts</h3>
        </div>
        {data.low_stock_alerts.length === 0 ? (
          <p style={{ color: 'var(--secondary)' }}>All inventory levels are healthy. No items require immediate attention.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Layout */}
            {data.low_stock_alerts.slice(0, 6).map((alert, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '8px', borderLeft: '4px solid #c62828' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>{alert.product_name}</h4>
                  <span style={{ fontSize: '13px', color: 'var(--secondary)' }}>Location: {alert.warehouse_name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#c62828' }}>{alert.quantity} in stock</div>
                  <div style={{ fontSize: '13px', color: 'var(--secondary)' }}>Minimum required: {alert.min_stock_level}</div>
                </div>
              </div>
            ))}
            
            {/* Show more */}
            {data.low_stock_alerts.length > 6 && (
              <button className="btn btn-secondary" style={{ alignSelf: 'center', marginTop: '16px' }}>
                Load more alerts
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
export default Dashboard;