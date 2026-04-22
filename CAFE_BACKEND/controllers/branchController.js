const db = require("../db");

// ================= GET ALL BRANCHES =================
exports.getBranches = (req, res) => {
  const sql = `
    SELECT 
      id,
      name,
      location,
      contact,
      manager
    FROM branches;
  `

  db.query(sql, (err, result) => {
    if (err) {
      console.log("FETCH ERROR:", err);
      return res.status(500).json(err);
    }

    res.json(result); // must return array
  });
};

// ================= ADD BRANCH =================
exports.addBranch = (req, res) => {
  const { name, location, contact, manager } = req.body;

  const sql = "INSERT INTO branches (name, location, contact, manager) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, location, contact, manager], (err) => {
    if (err) {
      console.log("INSERT ERROR:", err);
      return res.status(500).json(err);
    }

    res.json({ message: "Branch added successfully" });
  });
};

// ================= UPDATE BRANCH =================
exports.updateBranch = (req, res) => {
  const { name, location, contact, manager } = req.body;

  const sql = "UPDATE branches SET name=?, location=?, contact=?, manager=? WHERE id=?";

  db.query(sql, [name, location, contact, manager, req.params.id], (err) => {
    if (err) {
      console.log("UPDATE ERROR:", err);
      return res.status(500).json(err);
    }

    res.json({ message: "Branch updated successfully" });
  });
};

// ================= DELETE BRANCH =================
exports.deleteBranch = (req, res) => {
  const sql = "DELETE FROM branches WHERE id=?";

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.log("DELETE ERROR:", err);
      return res.status(500).json(err);
    }

    res.json({ message: "Branch deleted successfully" });
  });
};