const express = require("express");
const cors = require("cors");

// Try to load dotenv if available, otherwise use process.env directly
try {
  require("dotenv").config();
} catch (e) {
  // dotenv not installed, will use process.env directly
}

const branchRoutes = require("./routes/branchRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const menuRoutes = require("./routes/menuRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const recipeRoutes = require("./routes/recipeRoutes");

const db = require("./db");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROUTES =================
app.use("/branches", branchRoutes);
app.use("/employees", employeeRoutes);
app.use("/menu", menuRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/recipe", recipeRoutes);

// ================= CART =================

// Add to cart
app.post("/cart", (req, res) => {
  const { customer_id, item_name, price, quantity } = req.body;

  const sql = `
    INSERT INTO cart (customer_id, item_name, price, quantity)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [customer_id, item_name, price, quantity], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Item added to cart" });
  });
});

// Get cart
app.get("/cart/:customer_id", (req, res) => {
  const sql = "SELECT * FROM cart WHERE customer_id = ?";

  db.query(sql, [req.params.customer_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Delete cart item
app.delete("/cart/:id", (req, res) => {
  const sql = "DELETE FROM cart WHERE cart_id = ?";

  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
});

// Update quantity
app.put("/cart/:id", (req, res) => {
  const { quantity } = req.body;

  const sql = "UPDATE cart SET quantity = ? WHERE cart_id = ?";

  db.query(sql, [quantity, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Updated" });
  });
});

// ================= CHECKOUT =================

app.post("/checkout", (req, res) => {
  const { customer_id } = req.body;

  const getCart = "SELECT * FROM cart WHERE customer_id = ?";

  db.query(getCart, [customer_id], (err, items) => {
    if (err) return res.status(500).json(err);

    let total = 0;

    items.forEach(item => {
      total += item.price * item.quantity;
    });

    // Update stock
    items.forEach(item => {
      const updateStock = `
        UPDATE menu SET stock = stock - ?
        WHERE item_name = ?
      `;
      db.query(updateStock, [item.quantity, item.item_name]);
    });

    // Save order
    const orderSql = "INSERT INTO orders (customer_id, total) VALUES (?, ?)";

    db.query(orderSql, [customer_id, total], (err) => {
      if (err) return res.status(500).json(err);

      // Clear cart
      db.query("DELETE FROM cart WHERE customer_id = ?", [customer_id]);

      res.json({ message: "Order placed", total });
    });
  });
});

// ================= USERS =================

// Register
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const getNextIdSql = "SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM users";

  db.query(getNextIdSql, (idErr, idRows) => {
    if (idErr) return res.status(500).json(idErr);

    const nextId = idRows[0].nextId;
    const sql = "INSERT INTO users (id, email, password) VALUES (?, ?, ?)";

    db.query(sql, [nextId, email, password], (err) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ id: nextId, email, message: "User registered" });
    });
  });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      return res.status(200).json({
        id: result[0].id,
        email: result[0].email
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  });
});

// User profile
app.get("/user/:id", (req, res) => {
  const sql = "SELECT id, email FROM users WHERE id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

// ================= SPECIALS =================

app.get("/specials", (req, res) => {
  const sql = "SELECT * FROM menu ORDER BY item_rating DESC LIMIT 3";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ================= STATS =================

app.get("/stats", (req, res) => {
  const sql = `
    SELECT 
    (SELECT COUNT(*) FROM orders) AS total_orders,
    (SELECT SUM(total) FROM orders) AS revenue
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
