import { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, Edit, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from './api';
import ImportCSV from './ImportCSV';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', contact_name: '', email: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const validatePhone = (phone) => {
    if (!phone) return true;
    const regex = /^\+?[0-9]{7,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    return regex.test(cleanPhone);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validatePhone(formData.phone)) {
      return toast.error("Invalid phone format. Please use a valid number (e.g. +639123456789).");
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/suppliers/${editingId}`, formData);
        toast.success("Supplier updated!");
      } else {
        await api.post('/suppliers', formData);
        toast.success("Supplier created!");
      }
      setFormData({ name: '', contact_name: '', email: '', phone: '', address: '' });
      setShowAddForm(false);
      setEditingId(null);
      fetchSuppliers();
    } catch (err) {
      toast.error("Failed to save: " + (err.response?.data?.detail || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (supplier) => {
    setFormData({ 
      name: supplier.name, 
      contact_name: supplier.contact_name || '',
      email: supplier.email || '', 
      phone: supplier.phone || '', 
      address: supplier.address || '' 
    });
    setEditingId(supplier.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success("Supplier deleted.");
      fetchSuppliers();
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  const resetForm = () => {
    setFormData({ name: '', contact_name: '', email: '', phone: '', address: '' });
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
            <h1 style={{ marginBottom: '4px' }}>Suppliers</h1>
            <p style={{ color: 'var(--secondary)', margin: 0 }}>Manage your wholesale vendors and distributors.</p>
          </div>
        </div>
        
        {!showAddForm && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn" onClick={() => setShowImport(true)}>
              <Upload size={18} /> Bulk Import
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={18} /> Add Supplier
            </button>
          </div>
        )}
      </header>

      {showImport && (
        <ImportCSV 
          entityName="Suppliers" 
          endpoint="/suppliers/bulk-import"
          templateHeaders={["Company Name", "Contact Name", "Email", "Phone", "Address"]}
          onImportSuccess={fetchSuppliers}
          onClose={() => setShowImport(false)}
        />
      )}

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="glass-panel" style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>{editingId ? 'Edit Supplier' : 'Add New Supplier'}</h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600' }}>Company Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600' }}>Contact Name</label>
              <input type="text" value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600' }}>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600' }}>Phone (e.g. +639...)</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} placeholder="+639123456789" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Address</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} />
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
        ) : suppliers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary)' }}>
            No suppliers found. Click "Add Supplier" to create your first vendor.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Company Name</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Contact</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Phone</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((sup) => (
                <tr key={sup.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '600' }}>{sup.name}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--secondary)' }}>{sup.contact_name || "-"}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color="var(--secondary)"/> {sup.email || "-"}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="var(--secondary)"/> {sup.phone || "-"}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(sup)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '16px', color: 'var(--primary)' }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(sup.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828' }}>
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

export default Suppliers;
