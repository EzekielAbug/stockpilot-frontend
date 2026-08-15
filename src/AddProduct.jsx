import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, UploadCloud, Image as ImageIcon } from 'lucide-react';
import api from './api';

const AddProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', sku: '', price: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a temporary URL to show the user a preview of their image instantly!
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  // The Magic Function: Upload Image and Save Database Record!
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalImageUrl = null;

      // 1️⃣ IF USER SELECTED AN IMAGE, UPLOAD IT VIA FASTAPI
      if (selectedFile) {
        
        // We must use FormData to send binary files!
        const imageFormData = new FormData();
        imageFormData.append('file', selectedFile);

        const uploadResponse = await api.post('/uploads/image', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        // The backend returns the final S3 (or mock) URL!
        finalImageUrl = uploadResponse.data.url;
      }

      // 2️⃣ SAVE THE PRODUCT
      await api.post('/products', {
        name: formData.name,
        sku: formData.sku || undefined,
        price: parseFloat(formData.price),
        image_url: finalImageUrl // This will be null if no image was uploaded
      });

      // 3️⃣ SUCCESS! Send them back to the catalog to see their new product!
      navigate('/products');

    } catch (err) {
      console.error(err);
      setError("Failed to create product. " + (err.response?.data?.detail || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary)' }}>
          <PackagePlus color="var(--text-color)" />
        </div>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Add New Product</h1>
          <p style={{ color: 'var(--secondary)', margin: 0 }}>Create a new SKU in your inventory catalog.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {error && <div style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px' }}>{error}</div>}

        {/* IMAGE UPLOAD SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600' }}>Product Image</label>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Image Preview Thumbnail */}
            <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--secondary)' }}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon color="var(--secondary)" />
              )}
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              style={{ display: 'none' }} 
            />

            {/* Custom Styled Upload Button */}
            <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
              <UploadCloud size={18} /> Choose Image
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Product'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')} disabled={loading}>
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddProduct;