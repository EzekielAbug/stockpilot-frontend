import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from './api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    org_name: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Send the registration payload to FastAPI
      const response = await api.post('/auth/register', formData);
      
      // Save the token
      localStorage.setItem('token', response.data.access_token);
      
      // Navigate straight to the dashboard
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginBottom: '16px' }}>
            <UserPlus size={32} color="var(--text-color)" />
          </div>
          <h2>Create an Account</h2>
          <p style={{ color: 'var(--secondary)' }}>Set up your organization workspace and admin account.</p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {error && (
            <div style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Organization Name</label>
            <input 
              type="text" name="org_name" value={formData.org_name} onChange={handleChange}
              placeholder="Acme Corp" required
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--secondary)', background: 'rgba(255,255,255,0.5)', fontFamily: 'inherit', color: 'var(--text-color)', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Your Full Name</label>
            <input 
              type="text" name="full_name" value={formData.full_name} onChange={handleChange}
              placeholder="John Doe" required
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--secondary)', background: 'rgba(255,255,255,0.5)', fontFamily: 'inherit', color: 'var(--text-color)', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Email Address</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="you@company.com" required
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--secondary)', background: 'rgba(255,255,255,0.5)', fontFamily: 'inherit', color: 'var(--text-color)', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Password</label>
            <input 
              type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder="••••••••" required minLength={8}
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--secondary)', background: 'rgba(255,255,255,0.5)', fontFamily: 'inherit', color: 'var(--text-color)', fontSize: '15px', outline: 'none' }}
            />
          </div>

          {/* Primary CTA */}
          <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }} disabled={loading}>
            {loading ? 'Building Workspace...' : 'Build Workspace'}
          </button>
          
          {/* Secondary CTA (Link to Login) */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/login" style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
              Already have an account? Log in
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Register;