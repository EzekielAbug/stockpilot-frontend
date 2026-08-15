import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Plus, ChevronLeft, ChevronRight, Image as ImageIcon, Edit, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from './api';
import ImportCSV from './ImportCSV';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const size = 6; 

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products?page=${page}&size=${size}`);
      setProducts(response.data.items);
      setTotalPages(response.data.pages);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]); 

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted.");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to delete product.");
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary)' }}>
            <Package color="var(--text-color)" />
          </div>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Product Catalog</h1>
            <p style={{ color: 'var(--secondary)', margin: 0 }}>Manage your inventory items and SKUs.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" onClick={() => setShowImport(true)}>
            <Upload size={18} /> Bulk Import
          </button>
          <Link to="/products/add" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={18} /> Add Product
          </Link>
        </div>
      </header>

      {showImport && (
        <ImportCSV 
          entityName="Products" 
          endpoint="/products/bulk-import"
          templateHeaders={["Name", "SKU", "Description", "Price", "Cost Price", "Category"]}
          onImportSuccess={fetchProducts}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* DATA */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading catalog...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary)' }}>
            No products found. Build your catalog by clicking "Add Product".
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Image</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Product Name</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>SKU</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Price</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={20} color="var(--secondary)" />
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: '500' }}>{product.name}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--secondary)' }}>{product.sku}</td>
                  <td style={{ padding: '16px 24px' }}>${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => navigate(`/products/edit/${product.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '16px', color: 'var(--primary)' }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <button 
              className="btn btn-secondary" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Page {page} of {totalPages}</span>
            <button 
              className="btn btn-secondary" 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Products;