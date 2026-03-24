const router = require('express').Router();
const db = require('../db');

// Get all departments with doctor count
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, COUNT(doc.doctor_id) as doctor_count
      FROM departments d
      LEFT JOIN doctors doc ON d.dept_id = doc.dept_id
      GROUP BY d.dept_id
      ORDER BY d.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get department by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM departments WHERE dept_id = ?', [req.params.id]);
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create department
router.post('/', async (req, res) => {
  try {
    const { name, location } = req.body;
    await db.query('INSERT INTO departments (name, location) VALUES (?, ?)', [name, location]);
    res.status(201).json({ message: 'Department added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update department
router.put('/:id', async (req, res) => {
  try {
    const { name, location } = req.body;
    await db.query('UPDATE departments SET name = ?, location = ? WHERE dept_id = ?', 
      [name, location, req.params.id]);
    res.json({ message: 'Department updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete department
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM departments WHERE dept_id = ?', [req.params.id]);
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
