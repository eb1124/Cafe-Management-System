const db = require("../db");

// GET
exports.getMenu = (req, res) => {
  db.query("SELECT * FROM menu", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// ADD
exports.addMenuItem = (req, res) => {
  const { name, category, price, availability } = req.body;

  const sql = `
    INSERT INTO menu (name, category, price, availability)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, category, price, availability], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Menu item added" });
  });
};

// UPDATE
exports.updateMenuItem = (req, res) => {
  const { name, category, price, availability } = req.body;

  const sql = `
    UPDATE menu 
    SET name=?, category=?, price=?, availability=? 
    WHERE id=?
  `;

  db.query(sql, [name, category, price, availability, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Updated" });
  });
};

// DELETE
exports.deleteMenuItem = (req, res) => {
  db.query("DELETE FROM menu WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
};