import { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, Edit, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import api from './api';
import ImportCSV from './ImportCSV';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      return toast.error("Invalid phone format. Please select a country and enter a valid number.");
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/customers/${editingId}`, formData);
        toast.success("Customer updated!");
      } else {
        await api.post('/customers', formData);
        toast.success("Customer created!");
      }
      setFormData({ name: '', email: '', phone: '', address: '' });
      setShowAddForm(false);
      setEditingId(null);
      fetchCustomers();
    } catch (err) {
      toast.error("Failed to save: " + (err.response?.data?.detail || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (customer) => {
    setFormData({ 
      name: customer.name, 
      email: customer.email || '', 
      phone: customer.phone || '', 
      address: customer.address || '' 
    });
    setEditingId(customer.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success("Customer deleted.");
      fetchCustomers();
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '' });
    setShowAddForm(false);
    setEditingId(null);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary)' }}>
            <Users color="var(--text-color)" />
          </div>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Customers</h1>
            <p style={{ color: 'var(--secondary)', margin: 0 }}>Manage your B2B and retail clients.</p>
          </div>
        </div>
        
        {!showAddForm && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn" onClick={() => setShowImport(true)}>
              <Upload size={18} /> Bulk Import
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={18} /> Add Customer
            </button>
          </div>
        )}
      </header>

      {showImport && (
        <ImportCSV 
          entityName="Customers" 
          endpoint="/customers/bulk-import"
          templateHeaders={["Company Name", "Email", "Phone", "Address"]}
          onImportSuccess={fetchCustomers}
          onClose={() => setShowImport(false)}
        />
      )}

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="glass-panel" style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600' }}>Customer Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600' }}>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600' }}>Phone</label>
              <PhoneInput 
                international
                defaultCountry="PH"
                value={formData.phone} 
                onChange={(value) => setFormData({...formData, phone: value})} 
                className="glass-panel" 
                style={{ padding: '12px', border: '1px solid var(--secondary)', borderRadius: '8px' }} 
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600' }}>Address</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingId ? 'Update' : 'Save')}
            </button>
            <button type="button" className="btn btn-secondary" style={{ padding: '12px 24px' }} onClick={resetForm} disabled={isSubmitting}>Cancel</button>
          </div>
        </form>
      )}

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {error && <div style={{ padding: '20px', color: '#c62828' }}>{error}</div>}
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary)' }}>
            No customers found. Click "Add Customer" to create your first client.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Customer Name</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Phone</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Address</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cus) => (
                <tr key={cus.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '600' }}>{cus.name}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color="var(--secondary)"/> {cus.email || "-"}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="var(--secondary)"/> {cus.phone || "-"}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--secondary)' }}>{cus.address || "-"}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(cus)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '16px', color: 'var(--primary)' }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(cus.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Customers;
