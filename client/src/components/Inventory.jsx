import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', sku: '', price: '', stock: '', category: 'Shirts', image_url: '' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/inventory`).catch(() => null);
      if (res && res.data) {
        setProducts(res.data);
      } else {
        setProducts([
          { id: 1, name: 'Classic White T-Shirt', sku: 'TSHIRT-WHT-M', price: 1499, stock: 150 },
          { id: 2, name: 'Denim Jeans', sku: 'JEAN-BLU-32', price: 3999, stock: 85 }
        ]);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if(formData.id) {
      setProducts(products.map(p => p.id === formData.id ? {...formData, price: Number(formData.price), stock: Number(formData.stock)} : p));
    } else {
      const newProduct = { ...formData, id: Date.now(), price: Number(formData.price), stock: Number(formData.stock) };
      setProducts([newProduct, ...products]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleRestock = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/inventory/restock`, { productIds: [id] });
      alert('Smart Restock successful!');
      fetchInventory();
    } catch(err) {
      console.error(err);
      setProducts(products.map(p => p.id === id ? { ...p, stock: Math.max(p.stock, 50) } : p));
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h1>Inventory Management</h1>
        <button className="btn btn-primary" onClick={() => {
          setFormData({ id: '', name: '', sku: '', price: '', stock: '', category: 'Shirts', image_url: '' });
          setShowModal(true);
        }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <p>Loading inventory...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {p.name}
                      {p.stock <= 10 && <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255,86,48,0.1)', color: 'var(--danger-color)', borderRadius: '1rem', fontWeight: 600 }}>Low Stock</span>}
                      {p.stock > 15 && <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255,171,0,0.1)', color: '#b37700', borderRadius: '1rem', fontWeight: 600 }}>Review for Dead Stock</span>}
                    </div>
                  </td>
                  <td><span style={{ color: 'var(--text-muted)' }}>{p.sku}</span></td>
                  <td>₹{Number(p.price).toFixed(2)}</td>
                  <td>
                    <span style={{
                      color: p.stock <= 10 ? 'var(--danger-color)' : 'var(--secondary-color)',
                      fontWeight: 600
                    }}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="text-right">
                    {p.stock <= 10 && (
                      <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => handleRestock(p.id)}>
                        Restock
                      </button>
                    )}
                    <button className="btn" style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.25rem' }}
                      onClick={() => { setFormData(p); setShowModal(true); }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn" style={{ background: 'transparent', color: 'var(--danger-color)', padding: '0.25rem' }}
                      onClick={() => handleDelete(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 30, 66, 0.54)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
            <h2>{formData.id ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSave}>
              <div className="input-group">
                <label className="input-label">Product Name</label>
                <input required className="input-field" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">SKU</label>
                <input required className="input-field" type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Shirts">Shirts</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Pants">Pants</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Image URL</label>
                  <input className="input-field" type="url" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Price</label>
                  <input required className="input-field" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Stock</label>
                  <input required className="input-field" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <div className="flex-between" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-danger" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
