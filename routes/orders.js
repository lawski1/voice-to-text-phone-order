const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Get all orders
router.get('/', (req, res) => {
  const dbInstance = db.getDb();
  const { status, limit = 50 } = req.query;
  
  let query = `
    SELECT o.*, 
           GROUP_CONCAT(oi.item_name || ' x' || oi.quantity) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
  `;
  
  const params = [];
  if (status) {
    query += ' WHERE o.status = ?';
    params.push(status);
  }
  
  query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ?';
  params.push(parseInt(limit));
  
  dbInstance.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    
    // Parse items string
    const orders = rows.map(order => ({
      ...order,
      items: order.items ? order.items.split(', ') : []
    }));
    
    res.json(orders);
  });
});

// Get single order
router.get('/:id', (req, res) => {
  const dbInstance = db.getDb();
  const orderId = req.params.id;
  
  // Get order
  dbInstance.get(
    'SELECT * FROM orders WHERE id = ?',
    [orderId],
    (err, order) => {
      if (err) {
        console.error('Error fetching order:', err);
        return res.status(500).json({ error: 'Failed to fetch order' });
      }
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Get order items
      dbInstance.all(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId],
        (err, items) => {
          if (err) {
            console.error('Error fetching order items:', err);
            return res.status(500).json({ error: 'Failed to fetch order items' });
          }
          
          res.json({ ...order, items });
        }
      );
    }
  );
});

// Update order status
router.patch('/:id/status', (req, res) => {
  const dbInstance = db.getDb();
  const orderId = req.params.id;
  const { status } = req.body;
  
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  dbInstance.run(
    'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, orderId],
    function(err) {
      if (err) {
        console.error('Error updating order:', err);
        return res.status(500).json({ error: 'Failed to update order' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json({ message: 'Order status updated', orderId, status });
    }
  );
});

// Get call history
router.get('/calls/history', (req, res) => {
  const dbInstance = db.getDb();
  const { limit = 50 } = req.query;
  
  dbInstance.all(
    'SELECT * FROM phone_calls ORDER BY created_at DESC LIMIT ?',
    [parseInt(limit)],
    (err, rows) => {
      if (err) {
        console.error('Error fetching call history:', err);
        return res.status(500).json({ error: 'Failed to fetch call history' });
      }
      
      res.json(rows);
    }
  );
});

// Get statistics
router.get('/stats/summary', (req, res) => {
  const dbInstance = db.getDb();
  
  const stats = {};
  
  // Total orders
  dbInstance.get(
    'SELECT COUNT(*) as total FROM orders',
    [],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch stats' });
      }
      stats.totalOrders = row.total;
      
      // Orders by status
      dbInstance.all(
        'SELECT status, COUNT(*) as count FROM orders GROUP BY status',
        [],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch stats' });
          }
          stats.ordersByStatus = rows.reduce((acc, row) => {
            acc[row.status] = row.count;
            return acc;
          }, {});
          
          // Today's orders
          dbInstance.get(
            "SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE('now')",
            [],
            (err, row) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to fetch stats' });
              }
              stats.todayOrders = row.count;
              
              // Total revenue
              dbInstance.get(
                'SELECT SUM(total_amount) as total FROM orders WHERE status != "cancelled"',
                [],
                (err, row) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to fetch stats' });
                  }
                  stats.totalRevenue = row.total || 0;
                  
                  res.json(stats);
                }
              );
            }
          );
        }
      );
    }
  );
});

module.exports = router;

