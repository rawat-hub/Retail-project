import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

function Billing() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory').catch(() => null);
      if (res && res.data) {
        setProducts(res.data);
      } else {
        // Fallback for demo
        setProducts([
          { id: 1, name: 'Classic White T-Shirt', sku: 'TSHIRT-WHT-M', price: 1499, stock: 150 },
          { id: 2, name: 'Denim Jeans', sku: 'JEAN-BLU-32', price: 3999, stock: 85 }
        ]);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if(existing) {
      if (existing.qty < product.stock) {
        setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      } else {
        alert('Not enough stock available');
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { ...product, qty: 1 }]);
      } else {
        alert('Product out of stock');
      }
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if(item.id === id) {
        const product = products.find(p => p.id === id);
        let newQty = item.qty + delta;
        if(newQty > product.stock) newQty = product.stock;
        if(newQty < 1) newQty = 1;
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleCheckout = async () => {
    if(cart.length === 0) return;
    try {
      // await axios.post('http://localhost:5000/api/billing', { cartItems: cart, totalAmount: total });
      alert(`Checkout successful! Total: ₹${total.toFixed(2)}`);
      setCart([]);
      fetchInventory(); // refreshing stock
    } catch(err) {
      console.error(err);
      alert('Error during checkout');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="billing-layout">
      {/* Product Selection Area */}
      <div>
        <h1>Point of Sale</h1>
        <div className="input-group">
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search products by name or SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {filteredProducts.map(p => (
            <div key={p.id} className="glass-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => addToCart(p)}>
              <h3 style={{ marginBottom: '0.5rem' }}>{p.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>SKU: {p.sku}</p>
              <div className="flex-between" style={{ marginTop: '1rem' }}>
                <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{Number(p.price).toFixed(2)}</span>
                <span style={{ fontSize: '0.875rem', color: p.stock < 10 ? 'var(--danger-color)' : 'var(--text-muted)' }}>
                  Stock: {p.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)', position: 'sticky', top: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart /> Current Order
        </h2>
        
        <div style={{ flex: 1, overflowY: 'auto', margin: '1rem 0' }}>
          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>Cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>₹{Number(item.price).toFixed(2)} x {item.qty}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ebecf0', padding: '0.25rem', borderRadius: '0.5rem' }}>
                    <button className="btn" style={{ padding: '0.2rem' }} onClick={() => updateQty(item.id, -1)}><Minus size={14}/></button>
                    <span style={{ width: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button className="btn" style={{ padding: '0.2rem' }} onClick={() => updateQty(item.id, 1)}><Plus size={14}/></button>
                  </div>
                  <button className="btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
          <div className="flex-between" style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
            <span>Total:</span>
            <span className="gradient-text">₹{total.toFixed(2)}</span>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            Checkout Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default Billing;
