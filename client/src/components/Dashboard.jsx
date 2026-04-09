import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { AlertTriangle, PackageX, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const [chartData, setChartData] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [deadInventory, setDeadInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard-stats`).catch(() => null);
      
      if (res && res.data && res.data.labels) {
        setChartData({ labels: res.data.labels, datasets: res.data.datasets });
        setLowStock(res.data.lowStockItems || []);
        setDeadInventory(res.data.deadInventory || []);
      } else {
        // Fallback Mock Data
        setChartData({
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Mock Revenue (₹)',
              data: [9600, 15200, 24000, 20000, 32000, 36000, 40000],
              fill: true,
              backgroundColor: 'rgba(0, 82, 204, 0.2)',
              borderColor: 'rgba(0, 82, 204, 1)',
              tension: 0.4
            }
          ]
        });
        setLowStock([{ id: 'm1', name: 'Linen Summer Shirt', stock: 4 }]);
        setDeadInventory([{ id: 'm2', name: 'Heavyweight Blank Tee', stock: 200 }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (id) => {
     try {
       await axios.post(`${API_BASE_URL}/inventory/restock`, { productIds: [id] });
       alert('Smart Restock triggered successfully!');
       fetchAnalytics();
     } catch (err) {
       console.error(err);
       alert('Failed to restock. Server might be offline.');
     }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#6b778c' } },
      title: { display: false }
    },
    scales: {
      y: { ticks: { color: '#6b778c' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      x: { ticks: { color: '#6b778c' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <TrendingUp /> Dashboard Analytics
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Revenue Chart */}
        <div className="glass-card" style={{ gridColumn: '1 / -1', minHeight: '400px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Revenue Trend (Past 30 Days)</h2>
          {!loading && chartData ? (
             <div style={{ height: '350px' }}><Line options={options} data={chartData} /></div>
          ) : <p>Loading chart data...</p>}
        </div>

        {/* Low Stock Panel */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--danger-color)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)', marginBottom: '1rem' }}>
            <AlertTriangle /> Low Stock Alerts
          </h2>
          {lowStock.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Inventory levels are healthy.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {lowStock.map(item => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,86,48,0.1)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ display: 'block' }}>{item.name}</strong>
                    <span style={{ fontSize: '0.875rem', color: 'var(--danger-color)' }}>{item.stock} left in stock</span>
                  </div>
                  <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }} onClick={() => handleRestock(item.id)}>Restock</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dead Inventory Panel */}
        <div className="glass-card" style={{ borderLeft: '4px solid #ffab00' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffab00', marginBottom: '1rem' }}>
            <PackageX /> Dead Inventory Insight
          </h2>
          {deadInventory.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Great job! No dead stock detected.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {deadInventory.map(item => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,171,0,0.1)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ display: 'block' }}>{item.name}</strong>
                    <span style={{ fontSize: '0.875rem', color: '#b37700' }}>{item.stock} items taking space</span>
                  </div>
                  <button className="btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem', background: '#ffab00', color: '#172b4d' }} onClick={() => alert('Proposal applied! 20% Discount flag added.')}>
                    Discount 20%
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
