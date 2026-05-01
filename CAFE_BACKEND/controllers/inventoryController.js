const db = require("../db");

// Helper function to get current date in IST
const getCurrentDateIST = () => {
  const now = e.target.value;
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

const getNextInventoryId = (callback) => {
  db.query(
    "SELECT COALESCE(MAX(item_id), 0) + 1 AS nextId FROM inventory",
    (err, result) => {
      if (err) {
        return callback(err);
      }
      return callback(null, result[0].nextId);
    }
  );
};

exports.getInventory = (req, res) => {
  const sql = `
    SELECT
      item_id AS id,
      item_name AS itemName,
      quantity,
      unit,
      supplier,
      last_updated AS lastUpdated
    FROM inventory
    ORDER BY item_name ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(result);
  });
};

exports.addInventoryItem = (req, res) => {
  const { itemName, quantity, unit, supplier, lastUpdated } = req.body;
  const finalDate = lastUpdated || getCurrentDateIST();

  getNextInventoryId((idError, nextId) => {
    if (idError) {
      return res.status(500).json(idError);
    }

    const sql = `
      INSERT INTO inventory (item_id, item_name, quantity, unit, supplier, last_updated)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [nextId, itemName, quantity, unit, supplier, finalDate], (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.json({
        id: nextId,
        itemName,
        quantity,
        unit,
        supplier,
        lastUpdated: finalDate,
        message: "Inventory item added successfully",
      });
    });
  });
};

exports.updateInventoryItem = (req, res) => {
  const { itemName, quantity, unit, supplier, lastUpdated } = req.body;

  const sql = `
    UPDATE inventory
    SET item_name=?, quantity=?, unit=?, supplier=?, last_updated=?
    WHERE item_id=?
  `;

  db.query(sql, [itemName, quantity, unit, supplier, lastUpdated, req.params.id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json({ message: "Inventory item updated successfully" });
  });
};

exports.deleteInventoryItem = (req, res) => {
  db.query("DELETE FROM inventory WHERE item_id=?", [req.params.id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json({ message: "Inventory item deleted successfully" });
  });
};
