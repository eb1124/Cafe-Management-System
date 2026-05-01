const mysql = require("mysql2");

try {
  require("dotenv").config();
} catch (e) {
  // dotenv not installed or no .env file available
}

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '@Bhu02071979',
  database: process.env.DB_NAME || 'cafe_db',
  dateStrings: true   // ✅ Keep date values as strings
});

db.connect((err) => {
  if (err) {
    console.log("DB Connection Error:", err);
  } else {
    console.log("Connected to MySQL database");

    db.query("SET SESSION time_zone = '+05:30'", (err) => {
      if (err) console.log("Timezone setup error:", err);
      else console.log("Database timezone set to IST (UTC+5:30)");
    });
  }
});

module.exports = db;