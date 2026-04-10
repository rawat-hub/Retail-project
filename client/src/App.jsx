import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import Storefront from './components/Storefront';


function AdminLayout() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-title">
          <span className="gradient-text">MSR Admin</span>
        </div>
        <nav className="nav-links">
          <NavLink end to="/admin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/inventory" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Package size={20} /> Inventory
          </NavLink>
          <NavLink to="/admin/billing" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={20} /> Point of Sale
          </NavLink>
        </nav>
        <div style={{ marginTop: 'auto' }}>
           <Link to="/" className="nav-link" style={{ color: 'var(--text-muted)' }}>
             <LogOut size={20} /> Exit Admin
           </Link>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {}
        <Route path="/" element={<Storefront />} />

        {}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="billing" element={<Billing />} />
        </Route>
        
        {}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
