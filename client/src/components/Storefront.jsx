import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

// High quality placeholder garments
const STORE_PRODUCTS = [
  { id: 101, name: 'Premium Oxford Shirt', category: 'Shirts', price: 4999, image_url: '/img/oxford.png', stock: 45 },
  { id: 102, name: 'Linen Summer Shirt', category: 'Shirts', price: 3999, image_url: '/img/linen.png', stock: 20 },
  { id: 103, name: 'Casual Denim Shirt', category: 'Shirts', price: 5499, image_url: '/img/denim.png', stock: 15 },
  { id: 201, name: 'Essential Graphic T-Shirt', category: 'T-Shirts', price: 1499, image_url: '/img/graphic_tee.png', stock: 100 },
  { id: 202, name: 'Heavyweight Blank Tee', category: 'T-Shirts', price: 999, image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80', stock: 200 },
  { id: 203, name: 'Vintage Wash T-Shirt', category: 'T-Shirts', price: 1999, image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&q=80', stock: 40 },
];

function Storefront() {
  const [products, setProducts] = useState(STORE_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/inventory`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(err => console.error("Storefront DB fetch failed, using fallback.", err));
  }, []);

  const shirts = products.filter(p => p.category === 'Shirts');
  const tshirts = products.filter(p => p.category === 'T-Shirts');

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setIsCartOpen(true);
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleCheckout = async () => {
    if(cart.length === 0) return;
    try {
      await fetch(`${API_BASE_URL}/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart, totalAmount: cartTotal })
      });
      alert(`Checkout successful! Total: ₹${cartTotal.toFixed(2)}`);
      setCart([]);
      setIsCartOpen(false);
      // Refresh inventory if needed
    } catch(err) {
      console.error(err);
      alert('Error during checkout');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#172b4d', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Navbar */}
      <nav style={{ padding: '1.25rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dfe1e6', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', zIndex: 40, backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>MSR</h1>
          <div style={{ display: 'flex', gap: '1.5rem', fontWeight: 500, color: '#6b778c' }}>
            <a href="#shirts" style={{ textDecoration: 'none', color: 'inherit' }}>Shirts</a>
            <a href="#tshirts" style={{ textDecoration: 'none', color: 'inherit' }}>T-Shirts</a>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/admin" style={{ textDecoration: 'none', color: '#6b778c', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <User size={20} /> Admin Login
          </Link>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }} onClick={() => setIsCartOpen(!isCartOpen)}>
            <ShoppingBag size={24} color="#172b4d" />
            {cart.length > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: '#0052cc', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ 
        height: '60vh', 
        background: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80) center/cover', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Elevate Your Everyday Style</h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.9 }}>Discover our new collection of premium shirts and comfortable tees designed for modern living.</p>
          <a href="#shirts" style={{ background: '#fff', color: '#172b4d', padding: '1rem 2rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', display: 'inline-block' }}>Shop Now</a>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '4rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* SHIRTS SECTION */}
        <section id="shirts" style={{ marginBottom: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #dfe1e6', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', margin: 0, color: '#172b4d' }}>Premium Shirts</h2>
            <span style={{ color: '#6b778c', fontWeight: 500 }}>{shirts.length} Styles</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {shirts.map(product => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </section>

        {/* T-SHIRTS SECTION */}
        <section id="tshirts">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #dfe1e6', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', margin: 0, color: '#172b4d' }}>Comfort T-Shirts</h2>
            <span style={{ color: '#6b778c', fontWeight: 500 }}>{tshirts.length} Styles</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {tshirts.map(product => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </section>

      </main>

      {/* Cart Slide-out Drawer */}
      {isCartOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,30,66,0.5)', zIndex: 45 }} onClick={() => setIsCartOpen(false)} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', background: '#fff', zIndex: 50, boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #dfe1e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Your Bag</h3>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {cart.length === 0 ? (
                <p style={{ color: '#6b778c', textAlign: 'center', marginTop: '2rem' }}>Your shopping bag is empty.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <img src={item.image_url} alt={item.name} style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{item.name}</h4>
                      <p style={{ margin: 0, color: '#6b778c', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Qty: {item.qty}</p>
                      <p style={{ margin: 0, fontWeight: 600 }}>₹{(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid #dfe1e6', background: '#fafbfc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b778c', marginBottom: '1.5rem' }}>Taxes and shipping calculated at checkout.</p>
              <button 
                onClick={handleCheckout} 
                style={{ width: '100%', background: '#0052cc', color: '#fff', border: 'none', padding: '1rem', borderRadius: '4px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer style={{ background: '#f4f5f7', padding: '3rem 5%', textAlign: 'center', color: '#6b778c', borderTop: '1px solid #dfe1e6' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#172b4d', marginBottom: '1rem', margin: 0 }}>MSR Clothing Co.</p>
        <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} MSR. Premium Retail Platform.</p>
      </footer>
    </div>
  );
}

// Sub-component for products
function ProductCard({ product, onAdd }) {
  return (
    <div style={{ cursor: 'pointer', group: 'true' }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px', marginBottom: '1rem', background: '#f4f5f7', aspectRatio: '4/5' }}>
        <img 
          src={product.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80'} 
          alt={product.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
        />
      </div>
      <div>
        <p style={{ color: '#6b778c', fontSize: '0.875rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</p>
        <h3 style={{ fontSize: '1.125rem', margin: '0 0 0.5rem 0', color: '#172b4d', fontWeight: 500 }}>{product.name}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>₹{product.price.toFixed(2)}</span>
          <button 
            onClick={() => onAdd(product)}
            style={{ padding: '0.5rem 1rem', background: '#0052cc', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 500, cursor: 'pointer' }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Storefront;
