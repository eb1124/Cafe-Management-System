const db = require("../db");

// GET
exports.getCustomers = (req, res) => {
  db.query("SELECT * FROM customers", (err, result) => {
    if (err) {
      console.error("GET customers error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// ADD
exports.addCustomer = (req, res) => {
  const { name, phone, email, address } = req.body;
  
  console.log("======== ADD CUSTOMER REQUEST ========");
  console.log("Body received:", req.body);

  // First check what columns exist
  db.query("SHOW COLUMNS FROM customers", (err, columns) => {
    if (err) {
      console.error("❌ Cannot read customers table:", err.message);
      return res.status(500).json({ error: "Table error: " + err.message });
    }

    console.log("✅ Customers table columns:", columns.map(c => c.Field));

    const sql = "INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)";
    console.log("Executing:", sql);
    console.log("Values:", [name, phone, email, address]);

    db.query(sql, [name, phone, email, address], (err, result) => {
      if (err) {
        console.error("❌ INSERT failed:", err.message);
        console.error("Error code:", err.code);
        return res.status(500).json({ error: err.message, code: err.code });
      }
      console.log("✅ Customer added with ID:", result.insertId);
      res.json({ message: "Customer added", id: result.insertId });
    });
  });
};

// UPDATE
exports.updateCustomer = (req, res) => {
  const { name, phone, email, address } = req.body;

  const sql = "UPDATE customers SET name=?, phone=?, email=?, address=? WHERE id=?";

  db.query(sql, [name, phone, email, address, req.params.id], (err) => {
    if (err) {
      console.error("UPDATE customer error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Updated" });
  });
};

// DELETE
exports.deleteCustomer = (req, res) => {
  db.query("DELETE FROM customers WHERE id=?", [req.params.id], (err) => {
    if (err) {
      console.error("DELETE customer error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Deleted" });
  });
};