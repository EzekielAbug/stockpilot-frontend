import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, CheckCircle, Package, Search, Printer, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from './api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState({}); // Mapping of product.id -> total stock
  const [loading, setLoading] = useState(true);
  
  // Point of Sale Form State
  const [showForm, setShowForm] = useState(false);
  const [cart, setCart] = useState([]); // [{ product, quantity }]
  const [notes, setNotes] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null); // Used for Receipt Modal

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, custRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products?page=1&size=100'),
        api.get('/customers')
      ]);
      setOrders(ordRes.data.filter(o => o.order_type === 'sale'));
      setCustomers(custRes.data);
      
      const productsData = prodRes.data.items;
      setProducts(productsData);

      // Fetch aggregate inventory for each product
      const invPromises = productsData.map(p => api.get(`/products/${p.id}/inventory`));
      const invResponses = await Promise.allSettled(invPromises);
      
      const invMap = {};
      productsData.forEach((p, idx) => {
        const res = invResponses[idx];
        if (res.status === 'fulfilled') {
          const totalStock = res.value.data.reduce((sum, item) => sum + item.quantity, 0);
          invMap[p.id] = totalStock;
        } else {
          invMap[p.id] = 0;
        }
      });
      setInventory(invMap);

    } catch (err) {
      toast.error('Failed to load POS data');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const availableStock = inventory[product.id] || 0;
    
    // Check if already in cart
    const existing = cart.find(c => c.product.id === product.id);
    const currentCartQty = existing ? existing.quantity : 0;
    
    if (currentCartQty + 1 > availableStock) {
      toast.error(`Cannot add more ${product.name}. Out of stock!`);
      return;
    }

    if (existing) {
      setCart(cart.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    toast.success(`Added ${product.name} to cart`);
  };

  const updateCartQty = (productId, newQty) => {
    const availableStock = inventory[productId] || 0;
    if (newQty > availableStock) {
      toast.error(`Not enough stock. Only ${availableStock} available.`);
      return;
    }
    if (newQty < 1) {
      setCart(cart.filter(c => c.product.id !== productId));
      return;
    }
    setCart(cart.map(c => c.product.id === productId ? { ...c, quantity: newQty } : c));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(c => c.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCreateOrder = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");

    setIsSubmitting(true);
    const loadingToast = toast.loading('Processing transaction...');
    
    try {
      const createRes = await api.post('/orders', {
        order_type: 'sale',
        customer_id: selectedCustomer || null,
        notes: notes,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: parseInt(item.quantity)
        }))
      });

      const confRes = await api.post(`/orders/${createRes.data.id}/confirm`);
      
      toast.success("Transaction Complete! Stock deducted.", { id: loadingToast });
      
      // Reset
      setShowForm(false);
      
      // Show Receipt Modal
      setCompletedOrder({ ...confRes.data, customerName: selectedCustomer ? customers.find(c => c.id === selectedCustomer)?.name : 'Walk-in Customer' });

      setCart([]);
      setNotes('');
      setSelectedCustomer('');
      fetchData(); // Refresh stock and orders

    } catch (err) {
      toast.error("Transaction failed: " + (err.response?.data?.detail || "Check stock levels"), { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

  // Render POS UI when showForm is true
  if (showForm) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0 }}>New Sale Checkout</h1>
            <p style={{ color: 'var(--secondary)', margin: 0 }}>Select products to add to cart</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Discard Sale</button>
        </header>

        <div style={{ display: 'flex', gap: '32px', flex: 1, overflow: 'hidden' }}>
          {/* LEFT: PRODUCT GRID */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <Search style={{ position: 'absolute', top: '12px', left: '16px', color: 'var(--secondary)' }} size={20} />
              <input 
                type="text" 
                placeholder="Search products by name or SKU..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                className="glass-panel"
                style={{ width: '100%', padding: '12px 16px 12px 48px', border: 'none', boxSizing: 'border-box' }}
              />
            </div>
            
            <div style={{ overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', paddingRight: '8px', paddingBottom: '20px' }}>
              {filteredProducts.map(product => {
                const stock = inventory[product.id] || 0;
                const isOutOfStock = stock === 0;
                return (
                  <div 
                    key={product.id} 
                    className="glass-panel"
                    onClick={() => !isOutOfStock && addToCart(product)}
                    style={{ 
                      padding: '16px', 
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isOutOfStock ? 0.5 : 1,
                      border: '1px solid rgba(255,255,255,0.4)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <div style={{ height: '100px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {product.image_url ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package color="var(--secondary)" />}
                    </div>
                    <div style={{ fontWeight: '600', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                    <div style={{ color: 'var(--secondary)', fontSize: '12px', marginBottom: '8px' }}>{product.sku}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800' }}>${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: isOutOfStock ? '#c62828' : '#2e7d32' }}>
                        {isOutOfStock ? 'Out of Stock' : `${stock} left`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT: CART */}
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', backgroundColor: 'rgba(232, 232, 240, 0.95)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><ShoppingCart size={20} /> Current Order</h3>
            
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--secondary)', marginTop: '40px' }}>Cart is empty</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.product.name}</div>
                        <div style={{ color: 'var(--secondary)', fontSize: '13px' }}>${item.product.price} x {item.quantity}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                          type="number" 
                          min="0"
                          value={item.quantity} 
                          onChange={(e) => updateCartQty(item.product.id, parseInt(e.target.value) || 0)}
                          style={{ width: '50px', padding: '8px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
                        />
                        <button className="btn btn-secondary" style={{ padding: '6px', border: 'none' }} onClick={() => removeFromCart(item.product.id)}>X</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 'auto' }}>
              <select 
                value={selectedCustomer} 
                onChange={e => setSelectedCustomer(e.target.value)}
                className="glass-panel"
                style={{ width: '100%', padding: '12px', border: 'none', marginBottom: '16px' }}
              >
                <option value="">-- No Customer Selected (Walk-in) --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <input type="text" placeholder="Add Order Notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="glass-panel" style={{ width: '100%', padding: '12px', border: 'none', marginBottom: '16px', boxSizing: 'border-box' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>
                <span>Total</span>
                <span>${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                onClick={handleCreateOrder}
                disabled={isSubmitting || cart.length === 0}
              >
                <CheckCircle size={20} /> Checkout & Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Orders Table
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* RECEIPT MODAL */}
      {completedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '400px', backgroundColor: '#fff', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <h2 style={{ margin: '0 0 8px 0' }}>StockPilot</h2>
                <div style={{ color: 'var(--secondary)', fontSize: '14px' }}>Order #{completedOrder.order_number}</div>
                <div style={{ color: 'var(--secondary)', fontSize: '14px' }}>{new Date().toLocaleString()}</div>
                <div style={{ color: 'var(--secondary)', fontSize: '14px', marginTop: '4px' }}>Customer: {completedOrder.customerName}</div>
              </div>
              <button onClick={() => setCompletedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            
            <div style={{ borderTop: '2px dashed #eee', borderBottom: '2px dashed #eee', padding: '16px 0', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {completedOrder.items.map((item, idx) => {
                // Find product name since backend only returns product_id in confirmation
                const p = products.find(prod => prod.id === item.product_id);
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span>{item.quantity}x {p ? p.name : 'Item'}</span>
                    <span>${item.total_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )
              })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginBottom: '32px' }}>
              <span>TOTAL</span>
              <span>${completedOrder.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={() => window.print()}>
              <Printer size={20} /> Print Receipt
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary)' }}>
            <ShoppingCart color="var(--text-color)" />
          </div>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Sales Terminal</h1>
            <p style={{ color: 'var(--secondary)', margin: 0 }}>Process sales and track order history.</p>
          </div>
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> New Point of Sale
        </button>
      </header>

      {/* DATA TABLE */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading history...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary)' }}>
            No transaction history yet. Process a new sale to get started.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Order #</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Items</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-color)' }}>{order.order_number}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: order.status === 'confirmed' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(230, 81, 0, 0.1)', color: order.status === 'confirmed' ? '#2e7d32' : '#e65100', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Package size={16} /> {order.items.length} item(s)
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: '800' }}>
                    ${order.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

export default Orders;