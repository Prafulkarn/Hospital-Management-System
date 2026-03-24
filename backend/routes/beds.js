const router = require('express').Router();
const db = require('../db');

// Get all beds
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM beds ORDER BY ward, bed_number');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bed by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM beds WHERE bed_id = ?', [req.params.id]);
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new bed
router.post('/', async (req, res) => {
  try {
    const { ward, bed_number } = req.body;
    await db.query('INSERT INTO beds (ward, bed_number) VALUES (?, ?)', [ward, bed_number]);
    res.status(201).json({ message: 'Bed added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update bed
router.put('/:id', async (req, res) => {
  try {
    const { ward, bed_number, is_occupied } = req.body;
    await db.query('UPDATE beds SET ward = ?, bed_number = ?, is_occupied = ? WHERE bed_id = ?', 
      [ward, bed_number, is_occupied, req.params.id]);
    res.json({ message: 'Bed updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete bed
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM beds WHERE bed_id = ?', [req.params.id]);
    res.json({ message: 'Bed deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available beds
router.get('/available/count', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as available FROM beds WHERE is_occupied = FALSE');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
