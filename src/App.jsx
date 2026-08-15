import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import api from './api';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(null);

    try {
      // Our FastAPI backend expects a JSON payload for this specific endpoint!
      const payload = {
        email: email,
        password: password
      };

      // Send the JSON request to our FastAPI backend!
      const response = await api.post('/auth/login', payload);

      localStorage.setItem('token', response.data.access_token);
      
      toast.success('Login successful!');
      navigate('/dashboard');
      
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      setError(err.response?.data?.detail || 'An error occurred during login');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginBottom: '16px' }}>
            <LogIn size={32} color="var(--text-color)" />
          </div>
          <h2>Welcome to StockPilot</h2>
          <p style={{ color: 'var(--secondary)' }}>Enter your credentials to access your organization workspace.</p>
        </div>

        {/* attached onSubmit to the form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {error && (
            <div style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                width: '100%', padding: '14px', borderRadius: '8px',
                border: '1px solid var(--secondary)', background: 'rgba(255,255,255,0.5)',
                fontFamily: 'inherit', color: 'var(--text-color)', fontSize: '15px', outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '14px', borderRadius: '8px',
                border: '1px solid var(--secondary)', background: 'rgba(255,255,255,0.5)',
                fontFamily: 'inherit', color: 'var(--text-color)', fontSize: '15px', outline: 'none'
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
            Access Workspace
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/register" style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
              Create a new workspace
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;