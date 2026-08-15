import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PackagePlus, UploadCloud, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from './api';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', sku: '', price: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setFormData({
          name: response.data.name,
          sku: response.data.sku || '',
          price: response.data.price
        });
        if (response.data.image_url) {
          setPreviewUrl(response.data.image_url);
        }
      } catch (err) {
        toast.error("Failed to load product.");
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let finalImageUrl = previewUrl; // Keep existing image if no new file

      if (selectedFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', selectedFile);
        const uploadResponse = await api.post('/uploads/image', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalImageUrl = uploadResponse.data.url;
      }

      await api.patch(`/products/${id}`, {
        name: formData.name,
        sku: formData.sku || undefined,
        price: parseFloat(formData.price),
        image_url: finalImageUrl
      });

      toast.success("Product updated successfully!");
      navigate('/products');

    } catch (err) {
      console.error(err);
      setError("Failed to update product. " + (err.response?.data?.detail || ""));
      toast.error("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary)' }}>
          <PackagePlus color="var(--text-color)" />
        </div>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Edit Product</h1>
          <p style={{ color: 'var(--secondary)', margin: 0 }}>Update SKU details.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {error && <div style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600' }}>Product Image</label>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--secondary)' }}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon color="var(--secondary)" />
              )}
            </div>

            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              style={{ display: 'none' }} 
            />

            <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
              <UploadCloud size={18} /> Update Image
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label style={{ fontWeight: '600' }}>Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Premium Widget" className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <label style={{ fontWeight: '600' }}>SKU (Leave blank to auto-generate)</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="WIDG-001" className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '50%' }}>
          <label style={{ fontWeight: '600' }}>Price (USD)</label>
          <input type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange} required placeholder="29.99" className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)' }} />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Update Product'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')} disabled={saving}>
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditProduct;
