require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase. For the demo, we will check if keys are provided,
// otherwise we can fallback or log a warning.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------------------------------------------------
// GET INVENTORY
// ---------------------------------------------------------
app.get('/api/inventory', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---------------------------------------------------------
// ADD INVENTORY ITEM
// ---------------------------------------------------------
app.post('/api/inventory', async (req, res) => {
  const { name, sku, price, stock, category, image_url } = req.body;
  const { data, error } = await supabase.from('products').insert([{ name, sku, price, stock, category, image_url }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// ---------------------------------------------------------
// UPDATE INVENTORY ITEM
// ---------------------------------------------------------
app.put('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { name, sku, price, stock, category, image_url } = req.body;
  const { data, error } = await supabase.from('products').update({ name, sku, price, stock, category, image_url }).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// ---------------------------------------------------------
// DELETE INVENTORY ITEM
// ---------------------------------------------------------
app.delete('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ---------------------------------------------------------
// BILLING / PROCESS SALE
// ---------------------------------------------------------
app.post('/api/billing', async (req, res) => {
  const { cartItems, totalAmount } = req.body;
  
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    // 1. Create a sale record
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ total_amount: totalAmount }])
      .select();

    if (saleError) throw saleError;
    const saleId = saleData[0].id;

    // 2. Prepare sale items & stock decrements
    const saleItemsToInsert = [];
    for (let item of cartItems) {
      saleItemsToInsert.push({
        sale_id: saleId,
        product_id: item.id,
        quantity: item.qty,
        price: item.price
      });
      
      // Fetch current stock to decrement safely (Assuming MVP low-concurrency)
      const { data: productData, error: stockFetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.id)
        .single();
      
      if (stockFetchError) throw stockFetchError;

      const newStock = Math.max(0, productData.stock - item.qty);
      
      const { error: stockUpdateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.id);
        
      if (stockUpdateError) throw stockUpdateError;
    }

    // 3. Insert sale items
    const { error: saleItemsError } = await supabase
      .from('sale_items')
      .insert(saleItemsToInsert);

    if (saleItemsError) throw saleItemsError;

    res.json({ success: true, saleId });
  } catch (err) {
    console.error('Checkout Error:', err);
    res.status(500).json({ error: err.message || 'Error processing transaction' });
  }
});

// ---------------------------------------------------------
// DASHBOARD STATS
// ---------------------------------------------------------
app.get('/api/dashboard-stats', async (req, res) => {
  // Aggregate data for Chart.js
  try {
    // Fetch recent 30 sales for chart representation
    const { data: recentSales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(30);

    if (salesError) throw salesError;

    // We can also fetch total products sold, but we'll stick to a Revenue chart for MVP
    const labels = recentSales.map(s => {
      const d = new Date(s.created_at);
      return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
    });
    
    const revenues = recentSales.map(s => s.total_amount);

    res.json({
      labels,
      datasets: [
        {
          label: 'Revenue (₹)',
          data: revenues,
          fill: true,
          backgroundColor: 'rgba(56, 189, 248, 0.2)',
          borderColor: 'rgba(56, 189, 248, 1)',
        }
      ]
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
