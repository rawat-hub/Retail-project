require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseKey);
app.get('/api/inventory', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.post('/api/inventory', async (req, res) => {
  const { name, sku, price, stock, category, image_url } = req.body;
  const { data, error } = await supabase.from('products').insert([{ name, sku, price, stock, category, image_url }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});
app.put('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { name, sku, price, stock, category, image_url } = req.body;
  const { data, error } = await supabase.from('products').update({ name, sku, price, stock, category, image_url }).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});
app.delete('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
app.post('/api/billing', async (req, res) => {
  const { cartItems } = req.body;
  
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    let calculatedTotal = 0;
    const itemsToProcess = [];
    for (let item of cartItems) {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('price, stock')
        .eq('id', item.id)
        .single();
        
      if (productError || !productData) {
         throw new Error(`Product ID ${item.id} not found`);
      }
      
      if (productData.stock < item.qty) {
         throw new Error(`Insufficient stock for ${item.name}. Only ${productData.stock} available.`);
      }

      calculatedTotal += (productData.price * item.qty);
      
      itemsToProcess.push({
        ...item,
        actualPrice: productData.price,
        newStock: productData.stock - item.qty
      });
    }
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ total_amount: calculatedTotal }])
      .select();

    if (saleError) throw saleError;
    const saleId = saleData[0].id;
    const saleItemsToInsert = [];
    for (let item of itemsToProcess) {
       saleItemsToInsert.push({
         sale_id: saleId,
         product_id: item.id,
         quantity: item.qty,
         price: item.actualPrice
       });
       
       const { error: stockUpdateError } = await supabase
         .from('products')
         .update({ stock: item.newStock })
         .eq('id', item.id);
         
       if (stockUpdateError) throw stockUpdateError;
    }

    const { error: saleItemsError } = await supabase
      .from('sale_items')
      .insert(saleItemsToInsert);

    if (saleItemsError) throw saleItemsError;

    res.json({ success: true, saleId, actualTotal: calculatedTotal });
  } catch (err) {
    console.error('Checkout Error:', err);
    res.status(500).json({ error: err.message || 'Error processing transaction' });
  }
});
app.post('/api/inventory/restock', async (req, res) => {
  const { productIds } = req.body;
  
  if (!productIds || productIds.length === 0) {
    return res.status(400).json({ error: 'No products provided' });
  }

  try {
    for (let id of productIds) {
       const { data, error } = await supabase
         .from('products')
         .select('stock')
         .eq('id', id)
         .single();
         
       if (!error && data) {
         const restockAmount = 50; 
         await supabase.from('products').update({ stock: Math.max(data.stock, restockAmount) }).eq('id', id);
       }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const { data: recentSales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(30);

    if (salesError) throw salesError;

    const labels = recentSales.map(s => {
      const d = new Date(s.created_at);
      return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
    });
    
    const revenues = recentSales.map(s => s.total_amount);
    const { data: lowStockItems } = await supabase
       .from('products')
       .select('*')
       .lte('stock', 10);
    const { data: potentialDeadItems } = await supabase
       .from('products')
       .select('*')
       .gt('stock', 15);
       
    const { data: recentSaleItems } = await supabase
       .from('sale_items')
       .select('product_id')
       .order('created_at', { ascending: false })
       .limit(200);
       
    const recentlySoldIds = new Set(recentSaleItems ? recentSaleItems.map(si => si.product_id) : []);
    const deadInventory = (potentialDeadItems || []).filter(p => !recentlySoldIds.has(p.id));

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
      ],
      lowStockItems: lowStockItems || [],
      deadInventory: deadInventory || []
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
