import { useState, useEffect } from 'react';
import { Package, Plus, Search, ChevronRight, ShoppingCart, Truck, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from './api';

const PurchaseOrders = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, supRes] = await Promise.all([
        api.get('/products?page=1&size=50'),
        api.get('/suppliers')
      ]);
      setProducts(prodRes.data.items);
      setSuppliers(supRes.data);
    } catch (err) {
      toast.error("Failed to load catalog data.");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (!selectedSupplier) return toast.error("Please select a supplier");

    setIsSubmitting(true);
    try {
      const orderData = {
        order_type: 'purchase',
        supplier_id: selectedSupplier,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      const res = await api.post('/orders', orderData);
      
      // Auto-confirm PO for demo purposes (so it shows up correctly in history)
      await api.post(`/orders/${res.data.id}/confirm`);

      toast.success("Purchase Order submitted successfully!");
      setCart([]);
      setSelectedSupplier('');
    } catch (err) {
      toast.error("Failed to submit PO: " + (err.response?.data?.detail || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', height: 'calc(100vh - 80px)', display: 'flex', gap: '24px' }}>
      
      {/* LEFT COLUMN: Catalog */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary)' }}>
            <Truck color="var(--text-color)" />
          </div>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Procurement</h1>
            <p style={{ color: 'var(--secondary)', margin: 0 }}>Create purchase orders to restock your inventory.</p>
          </div>
        </header>

        <div className="glass-panel" style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading catalog...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {products.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product)}
                  style={{ 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(0,0,0,0.1)', 
                    cursor: 'pointer',
                    backgroundColor: 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ width: '100%', height: '120px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={32} color="var(--secondary)" />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{product.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--secondary)' }}>{product.sku}</div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginTop: 'auto' }}>
                    ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: PO Cart */}
      <div className="glass-panel" style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={20} /> Current PO
        </h2>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Select Supplier</label>
          <select 
            value={selectedSupplier} 
            onChange={e => setSelectedSupplier(e.target.value)}
            className="glass-panel"
            style={{ width: '100%', padding: '12px', border: '1px solid var(--secondary)' }}
          >
            <option value="">-- Choose Supplier --</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--secondary)', marginTop: '40px' }}>No items added.</div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{item.product.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity}
                      onChange={(e) => {
                        const newQ = parseInt(e.target.value) || 1;
                        setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, quantity: newQ } : i));
                      }}
                      style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid var(--secondary)' }}
                    />
                    x ${item.product.price.toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontWeight: 'bold' }}>${(item.quantity * item.product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '20px' }}>×</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px dashed rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '20px', fontWeight: 'bold' }}>
            <span>Total:</span>
            <span>${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '16px' }}
            disabled={isSubmitting || cart.length === 0 || !selectedSupplier}
            onClick={handleCheckout}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Purchase Order'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default PurchaseOrders;
