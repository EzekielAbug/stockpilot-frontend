import { useState, useEffect } from 'react';
import { Warehouse, Plus, MapPin, Edit, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from './api';
import ImportCSV from './ImportCSV';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/warehouses');
      setWarehouses(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load warehouses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/warehouses/${editingId}`, formData);
        toast.success("Warehouse updated!");
      } else {
        await api.post('/warehouses', formData);
        toast.success("Warehouse created!");
      }
      setFormData({ name: '', location: '' });
      setShowAddForm(false);
      setEditingId(null);
      fetchWarehouses();
    } catch (err) {
      toast.error("Failed to save: " + (err.response?.data?.detail || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (wh) => {
    setFormData({ name: wh.name, location: wh.location || '' });
    setEditingId(wh.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) return;
    try {
      await api.delete(`/warehouses/${id}`);
      toast.success("Warehouse deleted.");
      fetchWarehouses();
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  const resetForm = () => {
    setFormData({ name: '', location: '' });
    setShowAddForm(false);
    setEditingId(null);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary)' }}>
            <Warehouse color="var(--text-color)" />
          </div>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Warehouses</h1>
            <p style={{ color: 'var(--secondary)', margin: 0 }}>Manage your physical storage locations.</p>
          </div>
        </div>
        
        {!showAddForm && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn" onClick={() => setShowImport(true)}>
              <Upload size={18} /> Bulk Import
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={18} /> Add Warehouse
            </button>
          </div>
        )}
      </header>

      {showImport && (
        <ImportCSV 
          entityName="Warehouses" 
          endpoint="/warehouses/bulk-import"
          templateHeaders={["Name", "Location"]}
          onImportSuccess={fetchWarehouses}
          onClose={() => setShowImport(false)}
        />
      )}

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="glass-panel" style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>{editingId ? 'Edit Warehouse' : 'Add New Warehouse'}</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600' }}>Warehouse Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Main Distribution Center" className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600' }}>Location / Address</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="New York, NY" className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
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
        ) : warehouses.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary)' }}>
            No warehouses found. Click "Add Warehouse" to create your first location.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Warehouse Name</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Location</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((wh) => (
                <tr key={wh.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '500' }}>{wh.name}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} /> {wh.location || "N/A"}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: wh.is_active ? '#e8f5e9' : '#ffebee', color: wh.is_active ? '#2e7d32' : '#c62828', fontSize: '12px', fontWeight: 'bold' }}>
                      {wh.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(wh)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '16px', color: 'var(--primary)' }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(wh.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828' }}>
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

export default Warehouses;