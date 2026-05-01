const db = require("../db");

// Helper function to get current date in IST
const getCurrentDateIST = () => {
  const now = e.target.value;
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

const getNextId = (tableName, callback) => {
  const sql = `SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM ${tableName}`;
  db.query(sql, (err, result) => {
    if (err) {
      return callback(err);
    }
    return callback(null, result[0].nextId);
  });
};

// GET ALL ORDERS
exports.getOrders = (req, res) => {
  const sql = `
    SELECT 
      id,
      customerId,
      branchId,
      totalAmount,
      status,
      orderDate
    FROM orders
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(result);
  });
};

// ADD ORDER
exports.addOrder = (req, res) => {
  const { customerId, branchId, orderDate, totalAmount, status } = req.body;
  const orderStatus = status || "Pending";
  const finalOrderDate = orderDate || getCurrentDateIST();

  getNextId("orders", (idError, nextId) => {
    if (idError) {
      return res.status(500).json(idError);
    }

    const sql = `
      INSERT INTO orders (id, customerId, branchId, orderDate, totalAmount, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [nextId, customerId, branchId, finalOrderDate, totalAmount, orderStatus],
      (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.json({ 
        id: nextId,
        customerId, 
        branchId, 
        orderDate: finalOrderDate,
        totalAmount, 
        status: orderStatus,
        message: "Order created" 
      });
      }
    );
  });
};

// CONFIRM ORDER + PAYMENT IN ONE TRANSACTION
exports.confirmOrderWithPayment = (req, res) => {
  const {
    customerId,
    branchId,
    totalAmount,
    status,
    paymentMethod,
    paymentDate,
    paymentStatus,
  } = req.body;

  const orderStatus = status || "Pending";
  const finalPaymentMethod = paymentMethod || "Cash";
  const finalPaymentDate =
    paymentDate || getCurrentDateIST();
  const finalPaymentStatus = paymentStatus || "Pending";
  const finalOrderDate = req.body.orderDate || finalPaymentDate;

  db.beginTransaction((transactionError) => {
    if (transactionError) {
      return res.status(500).json(transactionError);
    }

    db.query(
      "SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM orders",
      (orderIdError, orderIdResult) => {
        if (orderIdError) {
          return db.rollback(() => res.status(500).json(orderIdError));
        }

        const orderId = orderIdResult[0].nextId;
        const insertOrderSql = `
          INSERT INTO orders (id, customerId, branchId, orderDate, totalAmount, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
          insertOrderSql,
          [orderId, customerId, branchId, finalOrderDate, totalAmount, orderStatus],
          (orderError) => {
        if (orderError) {
          return db.rollback(() => res.status(500).json(orderError));
        }

        db.query(
          "SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM payments",
          (paymentIdError, paymentIdResult) => {
            if (paymentIdError) {
              return db.rollback(() => res.status(500).json(paymentIdError));
            }

            const paymentId = paymentIdResult[0].nextId;
            const insertPaymentSql = `
              INSERT INTO payments (id, orderId, amount, paymentMethod, paymentDate, paymentStatus)
              VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
              insertPaymentSql,
              [
                paymentId,
                orderId,
                totalAmount,
                finalPaymentMethod,
                finalPaymentDate,
                finalPaymentStatus,
              ],
              (paymentError) => {
            if (paymentError) {
              return db.rollback(() => res.status(500).json(paymentError));
            }

            db.commit((commitError) => {
              if (commitError) {
                return db.rollback(() => res.status(500).json(commitError));
              }

              return res.status(201).json({
                order: {
                  id: orderId,
                  customerId,
                  branchId,
                  orderDate: finalOrderDate,
                  totalAmount,
                  status: orderStatus,
                },
                payment: {
                  id: paymentId,
                  orderId,
                  amount: totalAmount,
                  paymentMethod: finalPaymentMethod,
                  paymentDate: finalPaymentDate,
                  paymentStatus: finalPaymentStatus,
                },
                message: "Order and payment created successfully",
              });
            });
              }
            );
          }
        );
          }
        );
      }
    );
  });
};

// UPDATE ORDER
exports.updateOrder = (req, res) => {
  const { customerId, branchId, totalAmount, status, orderDate } = req.body;

  const sql = `
    UPDATE orders 
    SET customerId=?, branchId=?, totalAmount=?, status=?, orderDate=? 
    WHERE id=?
  `;

  db.query(
    sql,
    [customerId, branchId, totalAmount, status, orderDate, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.json({ message: "Updated" });
    }
  );
};

// DELETE ORDER
exports.deleteOrder = (req, res) => {
  const sql = "DELETE FROM orders WHERE id=?";

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json({ message: "Deleted" });
  });
};
