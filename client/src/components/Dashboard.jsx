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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // In production, this points to your server. For MVP without live DB,
      // we'll mock the data if the server isn't running or returns error.
      const res = await axios.get(`${API_BASE_URL}/analytics`).catch(() => null);
      
      if (res && res.data && res.data.labels) {
        setChartData(res.data);
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#6b778c' }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        ticks: { color: '#6b778c' },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        ticks: { color: '#6b778c' },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    }
  };

  return (
    <div>
      <h1>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card">
          <p className="input-label">Total Revenue Today</p>
          <div className="stat-value gradient-text">₹125,000.00</div>
        </div>
        <div className="glass-card">
          <p className="input-label">Transactions</p>
          <div className="stat-value">24</div>
        </div>
      </div>

      <div className="glass-card">
        <h2>Revenue Trend</h2>
        {!loading && chartData ? (
          <div style={{ height: '400px' }}>
            <Line options={options} data={chartData} />
          </div>
        ) : (
          <p>Loading chart data...</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
