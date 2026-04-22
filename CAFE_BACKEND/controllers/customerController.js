const db = require("../db");

// GET
exports.getCustomers = (req, res) => {
  db.query("SELECT * FROM customers", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// ADD
exports.addCustomer = (req, res) => {
  const { name, phone, email, address } = req.body;

  const sql = "INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, phone, email, address], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Customer added" });
  });
};

// UPDATE
exports.updateCustomer = (req, res) => {
  const { name, phone, email, address } = req.body;

  const sql = "UPDATE customers SET name=?, phone=?, email=?, address=? WHERE id=?";

  db.query(sql, [name, phone, email, address, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Updated" });
  });
};

// DELETE
exports.deleteCustomer = (req, res) => {
  db.query("DELETE FROM customers WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
};