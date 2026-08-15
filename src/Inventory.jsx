import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronLeft, ArrowDownToLine } from 'lucide-react';
import toast from 'react-hot-toast';
import api from './api';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State for Receiving Stock
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockForm, setStockForm] = useState({ warehouse_id: '', quantity_change: 1, reference: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products (first page is fine for now) and warehouses
      const [prodRes, whRes] = await Promise.all([
        api.get('/products?page=1&size=50'), 
        api.get('/warehouses')
      ]);
      
      const fetchedProducts = prodRes.data.items;

      // Fetch stock levels for each product to display in the table
      const stockPromises = fetchedProducts.map(p => api.get(`/products/${p.id}/inventory`));
      const stockResponses = await Promise.all(stockPromises);
      
      const productsWithStock = fetchedProducts.map((p, index) => {
        const inventoryItems = stockResponses[index].data;
        const totalStock = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
        return { ...p, total_stock: totalStock };
      });

      setProducts(productsWithStock);
      
      // Only keep active warehouses
      const activeWarehouses = whRes.data.filter(w => w.is_active);
      setWarehouses(activeWarehouses);
      
      // Auto-select first warehouse if available
      if (activeWarehouses.length > 0) {
        setStockForm(prev => ({ ...prev, warehouse_id: activeWarehouses[0].id }));
      }
      
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveStock = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/inventory/adjust', {
        product_id: selectedProduct.id,
        warehouse_id: stockForm.warehouse_id,
        quantity_change: parseInt(stockForm.quantity_change),
        reference: stockForm.reference || "Manual Stock Receipt"
      });
      
      // Reset form
      setSelectedProduct(null);
      setStockForm(prev => ({ ...prev, quantity_change: 1, reference: '' }));
      toast.success("Successfully received stock!");
      // Refresh the table to show updated stock
      fetchData();
      
    } catch (err) {
      toast.error("Failed to receive stock: " + (err.response?.data?.detail || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary)' }}>
            <ArrowDownToLine color="var(--text-color)" />
          </div>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Receive Inventory</h1>
            <p style={{ color: 'var(--secondary)', margin: 0 }}>Add physical stock to your warehouses.</p>
          </div>
        </div>
        
      </header>

      {/* RECEIVE STOCK INLINE FORM */}
      {selectedProduct && (
        <form onSubmit={handleReceiveStock} className="glass-panel" style={{ marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'flex-end', backgroundColor: 'rgba(200, 216, 232, 0.3)' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Receiving: {selectedProduct.name}</label>
            <select 
              value={stockForm.warehouse_id} 
              onChange={(e) => setStockForm({...stockForm, warehouse_id: e.target.value})} 
              className="glass-panel" 
              style={{ padding: '12px', border: '1px solid var(--secondary)', height: '44px' }}
              required
            >
              <option value="" disabled>Select Warehouse...</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
          </div>

          <div style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Quantity</label>
            <input type="number" min="1" value={stockForm.quantity_change} onChange={(e) => setStockForm({...stockForm, quantity_change: e.target.value})} required className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)', height: '44px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Reference (Optional)</label>
            <input type="text" placeholder="PO-12345" value={stockForm.reference} onChange={(e) => setStockForm({...stockForm, reference: e.target.value})} className="glass-panel" style={{ padding: '12px', border: '1px solid var(--secondary)', height: '44px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', height: '44px' }}>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Confirm Receipt</button>
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Cancel</button>
          </div>
        </form>
      )}

      {/* DATA TABLE */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {error && <div style={{ padding: '20px', color: '#c62828' }}>{error}</div>}
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary)' }}>
            No products found. Add products to your catalog first.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Product</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>SKU</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Current Stock</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} color="var(--secondary)" /></div>
                      )}
                      {product.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--secondary)' }}>{product.sku}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '700', color: product.total_stock > 0 ? '#10b981' : '#f43f5e' }}>
                    {product.total_stock} units
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                      onClick={() => setSelectedProduct(product)}
                    >
                      Receive Stock
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

export default Inventory;