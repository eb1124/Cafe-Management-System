const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "@Bhu02071979",
  database: "cafe_db",
});

db.connect((err) => {
  if (err) {
    console.log("DB Connection Error:", err);
  } else {
    console.log("Connected to MySQL database");
    // Set session timezone to IST (Asia/Kolkata)
    db.query("SET SESSION time_zone = '+05:30'", (err) => {
      if (err) console.log("Timezone setup error:", err);
      else console.log("Database timezone set to IST (UTC+5:30)");
    });
  }
});

module.exports = db;