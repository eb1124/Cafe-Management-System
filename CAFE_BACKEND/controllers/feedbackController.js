const db = require("../db");

// Helper function to get current date in IST
const getCurrentDateIST = () => {
  const now = new Date();
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

const getNextFeedbackId = (callback) => {
  db.query(
    "SELECT COALESCE(MAX(feedback_id), 0) + 1 AS nextId FROM feedback",
    (err, result) => {
      if (err) {
        return callback(err);
      }
      return callback(null, result[0].nextId);
    }
  );
};

exports.getFeedback = (req, res) => {
  const { rating } = req.query;
  let sql = `
    SELECT
      feedback_id AS id,
      rating,
      comments,
      feedback_date AS feedbackDate
    FROM feedback
  `;
  const params = [];

  if (rating && !isNaN(rating)) {
    sql += ` WHERE rating = ?`;
    params.push(parseInt(rating, 10));
  }

  sql += ` ORDER BY feedback_date DESC, feedback_id DESC`;

  db.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json(result);
  });
};

exports.addFeedback = (req, res) => {
  const { rating, comments, feedbackDate } = req.body;
  const finalDate = feedbackDate || getCurrentDateIST();

  getNextFeedbackId((idError, nextId) => {
    if (idError) {
      return res.status(500).json(idError);
    }

    const sql = `
      INSERT INTO feedback (feedback_id, rating, comments, feedback_date)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [nextId, rating, comments, finalDate], (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.json({
        id: nextId,
        rating,
        comments,
        feedbackDate: finalDate,
        message: "Feedback added successfully",
      });
    });
  });
};

exports.updateFeedback = (req, res) => {
  const { rating, comments, feedbackDate } = req.body;

  const sql = `
    UPDATE feedback
    SET rating=?, comments=?, feedback_date=?
    WHERE feedback_id=?
  `;

  db.query(sql, [rating, comments, feedbackDate, req.params.id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json({ message: "Feedback updated successfully" });
  });
};

exports.deleteFeedback = (req, res) => {
  db.query("DELETE FROM feedback WHERE feedback_id=?", [req.params.id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.json({ message: "Feedback deleted successfully" });
  });
};
